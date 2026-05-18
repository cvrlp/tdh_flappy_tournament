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
    const prevGamepadButtons = [[], []];
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

    // Call at end of each frame
    function endFrame() {
        Object.keys(keysJustPressed).forEach(k => keysJustPressed[k] = false);
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

    // Check if a gamepad button was just pressed
    function gamepadButtonJustPressed(padIndex, buttonIndex) {
        const pads = getGamepads();
        const pad = pads[padIndex];
        if (!pad) return false;
        const current = pad.buttons[buttonIndex] && pad.buttons[buttonIndex].pressed;
        const prev = prevGamepadButtons[padIndex] && prevGamepadButtons[padIndex][buttonIndex];
        return current && !prev;
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

    // Get gamepad D-pad / left stick direction (just pressed)
    function gamepadMenuDirection(padIndex) {
        const pads = getGamepads();
        const pad = pads[padIndex];
        if (!pad) return null;

        // D-pad buttons (standard mapping: 12=up, 13=down, 14=left, 15=right)
        if (gamepadButtonJustPressed(padIndex, 12)) return 'up';
        if (gamepadButtonJustPressed(padIndex, 13)) return 'down';
        if (gamepadButtonJustPressed(padIndex, 14)) return 'left';
        if (gamepadButtonJustPressed(padIndex, 15)) return 'right';

        // Left stick (with deadzone)
        const axes = pad.axes;
        const deadzone = 0.5;
        // Simple threshold-based detection for stick
        if (axes[1] < -deadzone && !(prevGamepadButtons[padIndex]['axisUp'])) {
            return 'up';
        }
        if (axes[1] > deadzone && !(prevGamepadButtons[padIndex]['axisDown'])) {
            return 'down';
        }
        if (axes[0] < -deadzone && !(prevGamepadButtons[padIndex]['axisLeft'])) {
            return 'left';
        }
        if (axes[0] > deadzone && !(prevGamepadButtons[padIndex]['axisRight'])) {
            return 'right';
        }

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

    // Store previous gamepad state (call at end of frame)
    function updateGamepadPrev() {
        const pads = getGamepads();
        for (let i = 0; i < 2; i++) {
            const pad = pads[i];
            if (!pad) {
                prevGamepadButtons[i] = [];
                continue;
            }
            prevGamepadButtons[i] = {};
            for (let b = 0; b < pad.buttons.length; b++) {
                prevGamepadButtons[i][b] = pad.buttons[b].pressed;
            }
            // Store axis states for direction detection
            const deadzone = 0.5;
            prevGamepadButtons[i]['axisUp'] = pad.axes[1] < -deadzone;
            prevGamepadButtons[i]['axisDown'] = pad.axes[1] > deadzone;
            prevGamepadButtons[i]['axisLeft'] = pad.axes[0] < -deadzone;
            prevGamepadButtons[i]['axisRight'] = pad.axes[0] > deadzone;
        }
    }

    // ---- Public API ----

    return {
        init,
        endFrame() {
            endFrame();
            updateGamepadPrev();
        },

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
