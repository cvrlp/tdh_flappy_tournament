// ============================================
// TDH FLAPPY TOURNAMENT — INPUT SYSTEM
// Keyboard + Gamepad API (2 controllers)
// ============================================

const Input = (() => {
    // Keyboard state
    const keys = {};
    const keysJustPressed = {};
    const prevKeys = {};

    // Gamepad state
    // Polled at requestAnimationFrame rate (see Input.poll) so brief presses that happen
    // between logic ticks aren't dropped. Buffers latch on edge and clear at endFrame.
    const gamepadPrevButtons = [{}, {}];
    const gamepadButtonBuffer = [{}, {}];
    const gamepadPrevAxis = [{}, {}];
    const gamepadAxisBuffer = [{}, {}];
    let gamepadsConnected = [false, false];

    // Key mappings — P1 and P2 have SEPARATE keys (no overlap)
    const P1_FLAP_KEYS = ['w', 'W', ' '];  // W or Space
    const P2_FLAP_KEYS = ['ArrowUp'];       // Arrow Up only
    const PAUSE_KEYS = ['Escape', 'p', 'P'];
    const MENU_UP_KEYS = ['w', 'W', 'ArrowUp'];
    const MENU_DOWN_KEYS = ['s', 'S', 'ArrowDown'];
    const MENU_LEFT_KEYS = ['a', 'A', 'ArrowLeft'];
    const MENU_RIGHT_KEYS = ['d', 'D', 'ArrowRight'];
    const CONFIRM_KEYS_P1 = [' '];                     // P1 uses Space to confirm
    const CONFIRM_KEYS_P2 = ['Enter'];                 // P2 uses Enter to confirm

    // Initialize keyboard listeners
    function init() {
        window.addEventListener('keydown', (e) => {
            if (!keys[e.key]) {
                keysJustPressed[e.key] = true;
            }
            keys[e.key] = true;
            // Prevent scrolling with arrow keys/space
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });

        window.addEventListener('gamepadconnected', (e) => {
            console.log(`🎮 Gamepad connected: ${e.gamepad.id} (index: ${e.gamepad.index})`);
            if (e.gamepad.index < 2) {
                gamepadsConnected[e.gamepad.index] = true;
            }
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            console.log(`🎮 Gamepad disconnected: ${e.gamepad.id}`);
            if (e.gamepad.index < 2) {
                gamepadsConnected[e.gamepad.index] = false;
            }
        });
    }

    // Call at end of each logic tick to drain edge-triggered buffers
    function endFrame() {
        Object.keys(keysJustPressed).forEach(k => keysJustPressed[k] = false);
        for (let i = 0; i < 2; i++) {
            gamepadButtonBuffer[i] = {};
            gamepadAxisBuffer[i] = {};
        }
    }

    // Sample gamepad state at requestAnimationFrame rate. Brief presses that happen
    // between logic ticks (common on >60Hz monitors) get latched here and consumed
    // by the next logic tick.
    function pollGamepads() {
        const pads = getGamepads();
        for (let i = 0; i < 2; i++) {
            const pad = pads[i];
            if (!pad) continue;
            // Buttons
            for (let b = 0; b < pad.buttons.length; b++) {
                const pressed = !!(pad.buttons[b] && pad.buttons[b].pressed);
                const wasPressed = gamepadPrevButtons[i][b] === true;
                if (pressed && !wasPressed) {
                    gamepadButtonBuffer[i][b] = true;
                }
                gamepadPrevButtons[i][b] = pressed;
            }
            // Axes — treated as directional buttons for menu nav
            const dz = 0.5;
            const axisStates = {
                up:    pad.axes[1] < -dz,
                down:  pad.axes[1] >  dz,
                left:  pad.axes[0] < -dz,
                right: pad.axes[0] >  dz,
            };
            for (const dir of ['up', 'down', 'left', 'right']) {
                const wasActive = gamepadPrevAxis[i][dir] === true;
                if (axisStates[dir] && !wasActive) {
                    gamepadAxisBuffer[i][dir] = true;
                }
                gamepadPrevAxis[i][dir] = axisStates[dir];
            }
        }
    }

    // Check if a key was just pressed this frame
    function justPressed(key) {
        return keysJustPressed[key] === true;
    }

    // Check if any key in array was just pressed
    function anyJustPressed(keyArray) {
        return keyArray.some(k => justPressed(k));
    }

    // Get gamepad objects
    function getGamepads() {
        return navigator.getGamepads ? navigator.getGamepads() : [];
    }

    // Check if a gamepad button was just pressed (reads the rAF-polled buffer)
    function gamepadButtonJustPressed(padIndex, buttonIndex) {
        return gamepadButtonBuffer[padIndex][buttonIndex] === true;
    }

    // Check if ANY button on a gamepad was just pressed (for flap)
    function gamepadAnyButtonJustPressed(padIndex) {
        const pads = getGamepads();
        const pad = pads[padIndex];
        if (!pad) return false;
        // Check face buttons (0-3), shoulders (4-5,6-7) but not sticks(10-11) or system(8-9 start/select excluded from flap)
        for (let i = 0; i <= 7; i++) {
            if (gamepadButtonJustPressed(padIndex, i)) return true;
        }
        return false;
    }

    // Check if Start button was just pressed on any gamepad
    function gamepadStartJustPressed() {
        for (let i = 0; i < 2; i++) {
            // Standard mapping: button 9 = Start
            if (gamepadButtonJustPressed(i, 9)) return true;
        }
        return false;
    }

    // Get gamepad D-pad / left stick direction (just pressed) — reads rAF-polled buffers
    function gamepadMenuDirection(padIndex) {
        // D-pad buttons (standard mapping: 12=up, 13=down, 14=left, 15=right)
        if (gamepadButtonJustPressed(padIndex, 12)) return 'up';
        if (gamepadButtonJustPressed(padIndex, 13)) return 'down';
        if (gamepadButtonJustPressed(padIndex, 14)) return 'left';
        if (gamepadButtonJustPressed(padIndex, 15)) return 'right';
        // Left stick
        if (gamepadAxisBuffer[padIndex]['up'])    return 'up';
        if (gamepadAxisBuffer[padIndex]['down'])  return 'down';
        if (gamepadAxisBuffer[padIndex]['left'])  return 'left';
        if (gamepadAxisBuffer[padIndex]['right']) return 'right';
        return null;
    }

    // A/Cross button just pressed (for confirm in menus)
    function gamepadConfirmJustPressed(padIndex) {
        return gamepadButtonJustPressed(padIndex, 0); // A / Cross
    }

    // B/Circle button just pressed (for back in menus)
    function gamepadBackJustPressed(padIndex) {
        return gamepadButtonJustPressed(padIndex, 1); // B / Circle
    }

    // ---- Public API ----

    return {
        init,
        poll: pollGamepads,
        endFrame,

        // Gameplay: did player flap?
        isFlap(playerIndex) {
            if (playerIndex === 0) {
                return anyJustPressed(P1_FLAP_KEYS) || gamepadAnyButtonJustPressed(0);
            } else {
                return anyJustPressed(P2_FLAP_KEYS) || gamepadAnyButtonJustPressed(1);
            }
        },

        // Menu navigation (combined for both keyboard and any gamepad)
        isMenuUp(playerIndex) {
            if (playerIndex === undefined) {
                return anyJustPressed(MENU_UP_KEYS) || gamepadMenuDirection(0) === 'up' || gamepadMenuDirection(1) === 'up';
            }
            if (playerIndex === 0) {
                return anyJustPressed(['w', 'W']) || gamepadMenuDirection(0) === 'up';
            }
            return anyJustPressed(['ArrowUp']) || gamepadMenuDirection(1) === 'up';
        },

        isMenuDown(playerIndex) {
            if (playerIndex === undefined) {
                return anyJustPressed(MENU_DOWN_KEYS) || gamepadMenuDirection(0) === 'down' || gamepadMenuDirection(1) === 'down';
            }
            if (playerIndex === 0) {
                return anyJustPressed(['s', 'S']) || gamepadMenuDirection(0) === 'down';
            }
            return anyJustPressed(['ArrowDown']) || gamepadMenuDirection(1) === 'down';
        },

        isMenuLeft(playerIndex) {
            if (playerIndex === undefined) {
                return anyJustPressed(MENU_LEFT_KEYS) || gamepadMenuDirection(0) === 'left' || gamepadMenuDirection(1) === 'left';
            }
            if (playerIndex === 0) {
                return anyJustPressed(['a', 'A']) || gamepadMenuDirection(0) === 'left';
            }
            return anyJustPressed(['ArrowLeft']) || gamepadMenuDirection(1) === 'left';
        },

        isMenuRight(playerIndex) {
            if (playerIndex === undefined) {
                return anyJustPressed(MENU_RIGHT_KEYS) || gamepadMenuDirection(0) === 'right' || gamepadMenuDirection(1) === 'right';
            }
            if (playerIndex === 0) {
                return anyJustPressed(['d', 'D']) || gamepadMenuDirection(0) === 'right';
            }
            return anyJustPressed(['ArrowRight']) || gamepadMenuDirection(1) === 'right';
        },

        isConfirm(playerIndex) {
            if (playerIndex === undefined) {
                return anyJustPressed(CONFIRM_KEYS_P1) || anyJustPressed(CONFIRM_KEYS_P2) || gamepadConfirmJustPressed(0) || gamepadConfirmJustPressed(1);
            }
            if (playerIndex === 0) {
                return anyJustPressed(CONFIRM_KEYS_P1) || gamepadConfirmJustPressed(0);
            }
            return anyJustPressed(CONFIRM_KEYS_P2) || gamepadConfirmJustPressed(1);
        },

        isBack(playerIndex) {
            if (playerIndex === undefined) {
                return justPressed('Backspace') || justPressed('Escape') || gamepadBackJustPressed(0) || gamepadBackJustPressed(1);
            }
            return justPressed('Backspace') || justPressed('Escape') || gamepadBackJustPressed(playerIndex);
        },

        isPause() {
            return anyJustPressed(PAUSE_KEYS) || gamepadStartJustPressed();
        },

        isAnyInput() {
            return Object.values(keysJustPressed).some(v => v) ||
                   gamepadAnyButtonJustPressed(0) ||
                   gamepadAnyButtonJustPressed(1);
        },

        getGamepadCount() {
            const pads = getGamepads();
            let count = 0;
            for (let i = 0; i < pads.length; i++) {
                if (pads[i]) count++;
            }
            return count;
        }
    };
})();
