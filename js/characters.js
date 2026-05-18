// ============================================
// TDH FLAPPY TOURNAMENT — CHARACTER DEFINITIONS
// 8 teams, each with unique pixel-art bird
// ============================================

const Characters = (() => {

    // Each character definition has colors + pixel art pattern
    const ROSTER = [
        {
            id: 0,
            team: 'Technology',
            tagline: 'Debugging the skies!',
            body: '#00BCD4',
            belly: '#B2EBF2',
            wing: '#0097A7',
            beak: '#FF9800',
            eye: '#FFFFFF',
            pupil: '#1A237E',
            crest: '#00838F',
            accent: '#76FF03',
            // Pixel body shape (14x12) — 1=body, 2=belly, 3=wing, 4=beak, 5=eye, 6=pupil, 7=crest, 8=accent
            pixels: null // We draw procedurally below
        },
        {
            id: 1,
            team: 'Product',
            tagline: 'Ship it or flip it!',
            body: '#FF6F00',
            belly: '#FFE0B2',
            wing: '#E65100',
            beak: '#FDD835',
            eye: '#FFFFFF',
            pupil: '#311B92',
            crest: '#FF8F00',
            accent: '#FF1744'
        },
        {
            id: 2,
            team: 'Marketing & UX',
            tagline: 'Designed to fly!',
            body: '#E91E63',
            belly: '#FCE4EC',
            wing: '#AD1457',
            beak: '#FFC107',
            eye: '#FFFFFF',
            pupil: '#1B5E20',
            crest: '#C2185B',
            accent: '#E040FB'
        },
        {
            id: 3,
            team: 'HR & Admin',
            tagline: 'People power!',
            body: '#9C27B0',
            belly: '#F3E5F5',
            wing: '#6A1B9A',
            beak: '#FFAB40',
            eye: '#FFFFFF',
            pupil: '#E65100',
            crest: '#7B1FA2',
            accent: '#FF4081'
        },
        {
            id: 4,
            team: 'Finance & Recon',
            tagline: 'Counting every flap!',
            body: '#2E7D32',
            belly: '#C8E6C9',
            wing: '#1B5E20',
            beak: '#FFD600',
            eye: '#FFFFFF',
            pupil: '#BF360C',
            crest: '#388E3C',
            accent: '#FFD700'
        },
        {
            id: 5,
            team: 'RAM, BI & Compliance',
            tagline: 'By the book!',
            body: '#1565C0',
            belly: '#BBDEFB',
            wing: '#0D47A1',
            beak: '#FF6D00',
            eye: '#FFFFFF',
            pupil: '#B71C1C',
            crest: '#1976D2',
            accent: '#00E5FF'
        },
        {
            id: 6,
            team: 'FinOps',
            tagline: 'Optimize everything!',
            body: '#F9A825',
            belly: '#FFF9C4',
            wing: '#F57F17',
            beak: '#FF3D00',
            eye: '#FFFFFF',
            pupil: '#1A237E',
            crest: '#FBC02D',
            accent: '#76FF03'
        },
        {
            id: 7,
            team: 'Merchant Services',
            tagline: 'Deal or no deal!',
            body: '#D84315',
            belly: '#FFCCBC',
            wing: '#BF360C',
            beak: '#FFEB3B',
            eye: '#FFFFFF',
            pupil: '#004D40',
            crest: '#E64A19',
            accent: '#00BFA5'
        }
    ];

    // Draw a pixel bird on a canvas context
    // flapFrame: 0 = wings up, 1 = wings mid, 2 = wings down (animation)
    function drawBird(ctx, char, x, y, size, flapFrame = 0, facingRight = true, dead = false) {
        const s = size / 14; // pixel unit
        ctx.save();

        if (dead) ctx.globalAlpha = 0.4;

        if (!facingRight) {
            ctx.translate(x + size / 2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-(x + size / 2), 0);
        }

        // Body (rounded square shape)
        ctx.fillStyle = char.body;
        fillBlock(ctx, x + s*2, y + s*2, s*10, s*9);
        // Top curve
        fillBlock(ctx, x + s*3, y + s*1, s*8, s*1);
        // Bottom curve
        fillBlock(ctx, x + s*3, y + s*11, s*8, s*1);

        // Belly
        ctx.fillStyle = char.belly;
        fillBlock(ctx, x + s*3, y + s*6, s*6, s*4);
        fillBlock(ctx, x + s*4, y + s*10, s*4, s*1);

        // Crest / hat (on top)
        ctx.fillStyle = char.crest;
        fillBlock(ctx, x + s*5, y, s*4, s*2);
        fillBlock(ctx, x + s*6, y - s, s*2, s*1);

        // Eye (right side)
        ctx.fillStyle = char.eye;
        fillBlock(ctx, x + s*9, y + s*3, s*3, s*3);
        // Pupil
        ctx.fillStyle = char.pupil;
        fillBlock(ctx, x + s*10, y + s*4, s*2, s*2);

        // Beak
        ctx.fillStyle = char.beak;
        fillBlock(ctx, x + s*12, y + s*5, s*3, s*2);
        fillBlock(ctx, x + s*13, y + s*4, s*1, s*1);

        // Wing
        ctx.fillStyle = char.wing;
        const wingY = flapFrame === 0 ? y + s*3 :
                       flapFrame === 2 ? y + s*8 : y + s*5;
        fillBlock(ctx, x, wingY, s*4, s*3);
        fillBlock(ctx, x - s, wingY + s, s*1, s*2);

        // Accent detail (small stripe or marking)
        ctx.fillStyle = char.accent;
        fillBlock(ctx, x + s*4, y + s*2, s*1, s*2);

        // --- Custom Department Accessories ---
        switch (char.id) {
            case 0: // Technology: Thick Glasses
                ctx.fillStyle = '#111';
                fillBlock(ctx, x + s*8, y + s*2, s*5, s*5); // frame
                ctx.fillStyle = char.eye;
                fillBlock(ctx, x + s*9, y + s*3, s*3, s*3); // inner white
                ctx.fillStyle = char.pupil;
                fillBlock(ctx, x + s*10, y + s*4, s*2, s*2); // pupil
                ctx.fillStyle = '#FFF';
                fillBlock(ctx, x + s*11, y + s*3, s*1, s*1); // glare
                // frame connector
                ctx.fillStyle = '#111';
                fillBlock(ctx, x + s*6, y + s*3, s*2, s*1);
                break;
            case 1: // Product: Backwards Baseball Cap
                ctx.fillStyle = char.accent;
                fillBlock(ctx, x + s*3, y - s*1, s*6, s*3); // hat body
                fillBlock(ctx, x + s*1, y + s*1, s*3, s*1); // brim backwards
                ctx.fillStyle = '#FFF';
                fillBlock(ctx, x + s*6, y, s*1, s*1); // hat button
                break;
            case 2: // Marketing: Cool Sunglasses
                ctx.fillStyle = '#111';
                fillBlock(ctx, x + s*8, y + s*3, s*4, s*3); // lenses
                fillBlock(ctx, x + s*6, y + s*3, s*2, s*1); // connector
                ctx.fillStyle = char.accent; // neon glare
                fillBlock(ctx, x + s*10, y + s*3, s*1, s*2);
                fillBlock(ctx, x + s*11, y + s*3, s*1, s*1);
                break;
            case 3: // HR & Admin: Necktie
                ctx.fillStyle = '#FFF'; // shirt collar
                fillBlock(ctx, x + s*6, y + s*6, s*3, s*1);
                ctx.fillStyle = char.accent; // tie
                fillBlock(ctx, x + s*7, y + s*6, s*1, s*4);
                fillBlock(ctx, x + s*6.5, y + s*10, s*2, s*1);
                break;
            case 4: // Finance: Monocle & Mustache
                // Mustache
                ctx.fillStyle = '#222';
                fillBlock(ctx, x + s*10, y + s*6, s*4, s*1);
                fillBlock(ctx, x + s*9, y + s*7, s*2, s*1);
                // Monocle chain
                ctx.fillStyle = '#FFD700';
                fillBlock(ctx, x + s*8, y + s*5, s*1, s*4);
                // Monocle rim
                fillBlock(ctx, x + s*9, y + s*3, s*1, s*3);
                fillBlock(ctx, x + s*10, y + s*2, s*2, s*1);
                break;
            case 5: // RAM & BI: Security Badge & Earpiece
                ctx.fillStyle = '#FFD700'; // gold badge
                fillBlock(ctx, x + s*5, y + s*6, s*2, s*2);
                ctx.fillStyle = '#FFF'; // star
                fillBlock(ctx, x + s*5.5, y + s*6.5, s*1, s*1);
                ctx.fillStyle = '#444'; // earpiece
                fillBlock(ctx, x + s*4, y + s*3, s*1, s*3);
                fillBlock(ctx, x + s*4, y + s*6, s*2, s*1);
                break;
            case 6: // FinOps: Green Visor
                ctx.fillStyle = 'rgba(76, 175, 80, 0.8)'; // translucent green
                fillBlock(ctx, x + s*4, y + s*1, s*8, s*3); // visor body
                ctx.fillStyle = '#1B5E20'; // visor brim
                fillBlock(ctx, x + s*7, y + s*3, s*6, s*1);
                break;
            case 7: // Merchant: Briefcase
                ctx.fillStyle = '#5D4037'; // brown case
                const caseY = wingY + s*1;
                fillBlock(ctx, x + s*1, caseY, s*5, s*4);
                ctx.fillStyle = '#8D6E63'; // case highlight
                fillBlock(ctx, x + s*2, caseY, s*3, s*1);
                ctx.fillStyle = '#FFD700'; // gold lock
                fillBlock(ctx, x + s*3, caseY + s*1, s*1, s*1);
                break;
        }

        // Outline (dark border for visibility)
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        // Top outline
        fillBlock(ctx, x + s*3, y + s*1 - 1, s*8, 1);
        // Bottom outline
        fillBlock(ctx, x + s*3, y + s*12, s*8, 1);
        // Left outline
        fillBlock(ctx, x + s*2 - 1, y + s*2, 1, s*9);
        // Right outline
        fillBlock(ctx, x + s*12, y + s*2, 1, s*5);

        ctx.restore();
    }

    function fillBlock(ctx, x, y, w, h) {
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }

    // 24x24 ASCII pixel grids for large Street Fighter-style profile portraits
    // Anthropomorphic bird busts: bird head + shoulders with department clothing
    // Color key: 0=outline 1=body 2=belly 3=wing/sleeve 4=beak 5=eye 6=pupil 7=crest 8=accent 9=skin A=white B=grey C=dark clothing
    const PROFILE_GRIDS = [
        // 0: Technology — Glasses, Hoodie, Headphones
        [
            "........................",
            "........07770...........",
            ".......0177710..........",
            "......011111110.........",
            ".....01111111110........",
            "....0111111111110.......",
            "....0111111111110.......",
            "...0B00000100000B0......",
            "...0B05550105550B0......",
            "...0B0555A105A550B0.....",
            "...0B05660105660B0......",
            "...0B05550105550B0......",
            "...0B00000100000B0......",
            "....01111104440110......",
            "....01111044440110......",
            ".....0111100001110......",
            "......001111110.........",
            ".......0011100..........",
            "......033333330.........",
            ".....03338883330........",
            "....0333388833330.......",
            "....0333333333330.......",
            "....0333333333330.......",
            ".....000000000000......."
        ],
        // 1: Product — Backwards Baseball Cap, Polo
        [
            "......088888880.........",
            ".....0888888888.........",
            "....08888888888.........",
            "...088880000088.........",
            "......011111110.........",
            ".....01111111110........",
            "....0111111111110.......",
            "....0111111111110.......",
            "...011155011550110......",
            "...011155011550110......",
            "...01115A01155A0110.....",
            "...011166011660110......",
            "....01111044401110......",
            "....01110444401110......",
            ".....0111000011110......",
            "......001111110.........",
            ".......0011100..........",
            "......022222220.........",
            ".....02222822220........",
            "....0222288222220.......",
            "....0222222222220.......",
            "....0222222222220.......",
            ".....02222222220........",
            "......000000000........."
        ],
        // 2: Marketing & UX — Beret, Stylish Scarf
        [
            ".......888888...........",
            "......88888888..........",
            ".....0888A88880.........",
            "......011111110.........",
            ".....01111111110........",
            "....0111111111110.......",
            "....0111111111110.......",
            "...011111111111110......",
            "...0110000110000110.....",
            "...01100A01100A0110.....",
            "...0110A80110A80110.....",
            "...0110000110000110.....",
            "...011111111111110......",
            "....01111104440110......",
            "....01111044440110......",
            ".....0111100001110......",
            "......001111110.........",
            ".......0011100..........",
            "......088008830.........",
            ".....08800883330........",
            "....0880088333330.......",
            "....0333333333330.......",
            "....0333333333330.......",
            ".....000000000000......."
        ],
        // 3: HR & Admin — Neat Feathers, Shirt Collar, Necktie
        [
            "........................",
            "........07770...........",
            ".......0177710..........",
            "......011111110.........",
            ".....01111111110........",
            "....0111111111110.......",
            "....0111111111110.......",
            "...011155011550110......",
            "...011155011550110......",
            "...01115A01155A0110.....",
            "...011166011660110......",
            "...011155011550110......",
            "....01111044401110......",
            "....01110444401110......",
            ".....0111000011110......",
            "......001111110.........",
            ".......0011100..........",
            ".....0AAA0880AAA0.......",
            "....0AAAA0880AAAA0......",
            "....0AAA008800AAA0......",
            "....033300880033300.....",
            "....033330880333300.....",
            "....033330880333300.....",
            ".....000000000000......."
        ],
        // 4: Finance & Recon — Top Hat, Mustache
        [
            ".......0000000000.......",
            ".......0777777770.......",
            ".......0777777770.......",
            ".....00000000000000.....",
            ".....011111111111110....",
            ".....011111111111110....",
            ".....011111111111110....",
            ".....01000011000010.....",
            ".....01055011055010.....",
            ".....0105A01105A010.....",
            ".....01066011066010.....",
            ".....01000011000010.....",
            "......011044440110......",
            ".......0104444010.......",
            "......022220022220......",
            ".......0222222220.......",
            "..........0110..........",
            "......033333333330......",
            ".....03333333333330.....",
            "....0333333333333330....",
            "....0338333333333830....",
            "....0333333333333330....",
            "....0333333333333330....",
            ".....00000000000000....."
        ],
        // 5: RAM, BI & Compliance — Earpiece, Badge, Formal
        [
            "........................",
            "........07770...........",
            ".......0177710..........",
            "......011111110.........",
            ".....01111111110........",
            "....0111111111110.......",
            "...B0111111111110.......",
            "...BB11155011550110.....",
            "...BB11155011550110.....",
            "...B01115A01155A0110....",
            "....011166011660110.....",
            "....011155011550110.....",
            "....01111044401110......",
            "....01110444401110......",
            ".....0111000011110......",
            "......001111110.........",
            ".......0011100..........",
            "......033333330.........",
            ".....03333333330........",
            "....0333388333330.......",
            "....03338AA833330.......",
            "....0333388333330.......",
            "....0333333333330.......",
            ".....000000000000......."
        ],
        // 6: FinOps — Green Visor, Rolled Sleeves
        [
            "........................",
            "........07770...........",
            ".......0177710..........",
            "......011111110.........",
            ".....01111111110........",
            "....0111111111110.......",
            "...088888888888880......",
            "...088888888888880......",
            "...011155011550110......",
            "...011155011550110......",
            "...01115A01155A0110.....",
            "...011166011660110......",
            "....01111044401110......",
            "....01110444401110......",
            ".....0111000011110......",
            "......001111110.........",
            ".......0011100..........",
            "......033333330.........",
            ".....03333333330........",
            "....0333333333330.......",
            "....0118333338110.......",
            "....0113333333110.......",
            "....0113333333110.......",
            ".....000000000000......."
        ],
        // 7: Merchant Services — Suit Collar, Briefcase
        [
            "........................",
            "........07770...........",
            ".......0177710..........",
            "......011111110.........",
            ".....01111111110........",
            "....0111111111110.......",
            "....0111111111110.......",
            "...011155011550110......",
            "...011155011550110......",
            "...01115A01155A0110.....",
            "...011166011660110......",
            "...011155011550110......",
            "....01111044401110......",
            "....01110444401110......",
            ".....0111000011110......",
            "......001111110.........",
            ".......0011100..........",
            ".....0333003330.........",
            "....033330033330........",
            "....033333333330........",
            "....033333333330.0BB0...",
            "....033333333330.0B80...",
            "....033333333330.0BB0...",
            ".....000000000000.00...."
        ]
    ];

    function drawProfileArt(ctx, charId, x, y, size) {
        const char = ROSTER[charId] || ROSTER[0];
        const grid = PROFILE_GRIDS[charId] || PROFILE_GRIDS[0];
        const pixelSize = size / 24;

        ctx.save();
        for (let row = 0; row < 24; row++) {
            for (let col = 0; col < 24; col++) {
                const p = grid[row][col];
                if (p === '.') continue;
                
                let color = '#000'; // 0
                switch(p) {
                    case '1': color = char.body; break;
                    case '2': color = char.belly; break;
                    case '3': color = char.wing; break;
                    case '4': color = char.beak; break;
                    case '5': color = char.eye; break;
                    case '6': color = char.pupil; break;
                    case '7': color = char.crest; break;
                    case '8': color = char.accent; break;
                    case '9': color = '#FFCCBC'; break;
                    case 'A': color = '#FFFFFF'; break;
                    case 'B': color = '#555555'; break; // Grey
                }
                
                ctx.fillStyle = color;
                fillBlock(ctx, x + col * pixelSize, y + row * pixelSize, pixelSize + 0.5, pixelSize + 0.5);
            }
        }
        ctx.restore();
    }

    // Draw a large character preview (for selection screen)
    function drawPreview(ctx, charId, x, y, size) {
        const char = ROSTER[charId];
        drawBird(ctx, char, x, y, size, 1, true, false);
    }

    // Draw character selection portrait with frame
    function drawPortrait(ctx, charId, x, y, size, selected, locked, hovered) {
        const char = ROSTER[charId];

        // Background
        ctx.fillStyle = locked ? 'rgba(255,255,255,0.05)' : (hovered ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.4)');
        ctx.fillRect(x, y, size, size);

        // Border
        ctx.strokeStyle = selected ? '#FFD700' : (locked ? '#333' : (hovered ? '#aaa' : '#555'));
        ctx.lineWidth = selected ? 3 : 1;
        ctx.strokeRect(x, y, size, size);

        // Draw bird inside
        const birdSize = size * 0.65;
        const bx = x + (size - birdSize) / 2;
        const by = y + (size - birdSize) / 2 - 2;

        if (locked) {
            ctx.globalAlpha = 0.2;
        }
        drawBird(ctx, char, bx, by, birdSize, 1, true, false);
        ctx.globalAlpha = 1;

        // Locked X overlay
        if (locked) {
            ctx.strokeStyle = '#F44336';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 4, y + 4);
            ctx.lineTo(x + size - 4, y + size - 4);
            ctx.moveTo(x + size - 4, y + 4);
            ctx.lineTo(x + 4, y + size - 4);
            ctx.stroke();
        }

        // Selection glow
        if (selected) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - 1, y - 1, size + 2, size + 2);
            ctx.shadowBlur = 0;
        }
    }

    return {
        ROSTER,
        drawBird,
        drawPreview,
        drawPortrait,
        drawProfileArt,
        getCharacter(id) { return ROSTER[id]; },
        getCount() { return ROSTER.length; }
    };
})();
