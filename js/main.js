        // ============================
        // CONFIGURAÇÕES GLOBAIS
        // ============================
        const GAME_STORAGE_KEY = 'JardimDosEcos_V3.5';
        const SAVE_DEBOUNCE_MS = 5000;
        const SELL_REFUND_PERCENTAGE = 0.5;
        const CYCLE_DURATION = 60000;
        const SCALE_FACTOR = 0.6;
        const PLANT_LIMIT = 6;
        const HILL_TOP_Y_FACTOR = 0.6;
        let animationTime = 0;

        const PALETTE = { SKY_TOP: [ { pos: 0.00, h: 240, s: 40, l: 20 }, { pos: 0.20, h: 220, s: 60, l: 45 }, { pos: 0.25, h: 30, s: 85, l: 70 }, { pos: 0.35, h: 200, s: 60, l: 75 }, { pos: 0.65, h: 30, s: 70, l: 55 }, { pos: 0.80, h: 250, s: 50, l: 30 }, { pos: 1.00, h: 240, s: 40, l: 20 }, ], SKY_BOTTOM: [ { pos: 0.00, h: 220, s: 30, l: 15 }, { pos: 0.20, h: 180, s: 50, l: 25 }, { pos: 0.25, h: 80, s: 60, l: 85 }, { pos: 0.35, h: 120, s: 50, l: 80 }, { pos: 0.65, h: 70, s: 60, l: 55 }, { pos: 0.80, h: 230, s: 40, l: 20 }, { pos: 1.00, h: 220, s: 30, l: 15 }, ], GROUND: [ { pos: 0.00, h: 140, s: 30, l: 10 }, { pos: 0.20, h: 120, s: 40, l: 15 }, { pos: 0.25, h: 80, s: 50, l: 25 }, { pos: 0.35, h: 100, s: 70, l: 35 }, { pos: 0.65, h: 60, s: 40, l: 20 }, { pos: 0.80, h: 140, s: 30, l: 10 }, { pos: 1.00, h: 140, s: 30, l: 10 }, ], };
        const PLANT_TYPES = { PATIENCE: { id: 'PATIENCE', name: "Paciência", cost: 5, baseRate: 0.1, color: '#4CAF50', symbol: '🌿', buff: 'IDLE_GAIN', levelCostScale: 1.4, baseLevel: 1, levelBonus: 10, drawStyle: 'SIMPLE' }, COURAGE: { id: 'COURAGE', name: "Coragem", cost: 25, baseRate: 0.2, color: '#FF5722', symbol: '🔥', buff: 'FAUNA_REWARD', levelCostScale: 1.6, baseLevel: 1, levelBonus: 25, drawStyle: 'PINE' }, WISDOM: { id: 'WISDOM', name: "Sabedoria", cost: 100, baseRate: 0.4, color: '#2196F3', symbol: '🧠', buff: 'FAUNA_LIFETIME', levelCostScale: 1.8, baseLevel: 1, levelBonus: 50, drawStyle: 'BONSAI' }, BEAUTY: { id: 'BEAUTY', name: "Beleza", cost: 300, baseRate: 0.8, color: '#E91E63', symbol: '🌸', buff: 'CLICK_RADIUS', levelCostScale: 2.0, baseLevel: 1, levelBonus: 75, drawStyle: 'MUSHROOM' }, TRUTH: { id: 'TRUTH', name: "Verdade", cost: 800, baseRate: 1.6, color: '#FFC107', symbol: '💎', buff: 'CRITICAL_CHANCE', levelCostScale: 2.2, baseLevel: 1, levelBonus: 100, drawStyle: 'CRYSTAL' }, LOGIC: { id: 'LOGIC', name: "Lógica", cost: 2000, baseRate: 3.0, color: '#00FF00', symbol: '🔢', buff: 'IDLE_GAIN', levelCostScale: 2.4, baseLevel: 1, levelBonus: 125, drawStyle: 'PIXEL' }, CREATIVITY: { id: 'CREATIVITY', name: "Criatividade", cost: 5000, baseRate: 5.0, color: '#DA70D6', symbol: '🎨', buff: 'IDLE_GAIN', levelCostScale: 2.6, baseLevel: 1, levelBonus: 150, drawStyle: 'SWIRLY' }, LEGACY: { id: 'LEGACY', name: "Legado", cost: 15000, baseRate: 8.0, color: '#8B4513', symbol: '🌳', buff: 'IDLE_GAIN', levelCostScale: 2.8, baseLevel: 1, levelBonus: 200, drawStyle: 'DEAD' } };
        const ERA_LEVELS = [ { id: 1, name: "Despertar", levelToUnlock: 0, unlockedPlants: ['PATIENCE', 'COURAGE'] }, { id: 2, name: "Harmonia", levelToUnlock: 100, unlockedPlants: ['WISDOM', 'BEAUTY'] }, { id: 3, name: "Iluminação", levelToUnlock: 500, unlockedPlants: ['TRUTH', 'LOGIC'] }, { id: 4, name: "Transcendência", levelToUnlock: 5000, unlockedPlants: ['CREATIVITY', 'LEGACY'] }, ];
        
        // ============================
        // FUNÇÕES DE DESENHO E CLASSES
        // ============================
        function darkenColor(hex, lum) { if (!hex || typeof hex !== 'string') return '#000000'; hex = hex.replace(/[^0-9a-f]/gi, ''); if (hex.length < 6) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]; lum = lum || 0; let rgb = "#", c, i; for (i = 0; i < 3; i++) { c = parseInt(hex.substr(i*2,2),16); c = Math.round(Math.min(255, Math.max(0, c + (c * lum)))); rgb += ("00"+c.toString(16)).substr(-2); } return rgb; }
        function calculateWindOffset(time, seedX, factor = 1.0) { return Math.sin(time * 0.003 + seedX * 0.05) * 5 * SCALE_FACTOR * factor; }
        function drawSimpleTree(ctx, x, y, trunkColor, leafColor, sizeFactor) { const windX = calculateWindOffset(animationTime, x, 0.6); ctx.translate(windX, 0); const size = 90 * SCALE_FACTOR * sizeFactor; const trunk_w = 30 * SCALE_FACTOR * sizeFactor; const trunk_h = 30 * SCALE_FACTOR * sizeFactor; const trunkGradient = ctx.createLinearGradient(0 - trunk_w/2, 0, 0 + trunk_w/2, 0); trunkGradient.addColorStop(0, darkenColor(trunkColor, -0.1)); trunkGradient.addColorStop(0.5, trunkColor); trunkGradient.addColorStop(1, darkenColor(trunkColor, -0.3)); ctx.fillStyle = trunkGradient; ctx.fillRect(0 - trunk_w / 2, y + 30 * SCALE_FACTOR, trunk_w, trunk_h); ctx.fillStyle = leafColor; ctx.fillRect(0 - size / 2, y - 20 * SCALE_FACTOR, size, size); ctx.fillStyle = darkenColor(leafColor, -0.3); ctx.fillRect(0, y - 20 * SCALE_FACTOR, size / 2, size); ctx.translate(-windX, 0); }
        function drawPineTree(ctx, x, y, trunkColor, leafColor, sizeFactor) { const h_trunk = 60 * SCALE_FACTOR * sizeFactor; const w_trunk = 20 * SCALE_FACTOR * sizeFactor; const windX = calculateWindOffset(animationTime, x, 0.5); ctx.translate(windX, 0); const trunkGradient = ctx.createLinearGradient(0 - w_trunk/2, 0, 0 + w_trunk/2, 0); trunkGradient.addColorStop(0, darkenColor(trunkColor, -0.2)); trunkGradient.addColorStop(0.5, trunkColor); trunkGradient.addColorStop(1, darkenColor(trunkColor, -0.1)); ctx.fillStyle = trunkGradient; ctx.fillRect(0 - w_trunk / 2, y, w_trunk, h_trunk); for (let i = 0; i < 3; i++) { const h = 80 * SCALE_FACTOR * sizeFactor; const w = (80 - i * 15) * SCALE_FACTOR * sizeFactor; const offset = i * 40 * SCALE_FACTOR * sizeFactor; const leafGradient = ctx.createLinearGradient(0, y - h - offset + h_trunk, 0, y - offset + h_trunk); leafGradient.addColorStop(0, leafColor); leafGradient.addColorStop(1, darkenColor(leafColor, -0.4)); ctx.fillStyle = leafGradient; ctx.beginPath(); ctx.moveTo(0, y - h - offset + h_trunk); ctx.lineTo(0 + w / 2, y - offset + h_trunk); ctx.lineTo(0 - w / 2, y - offset + h_trunk); ctx.closePath(); ctx.fill(); } ctx.translate(-windX, 0); }
        function drawBonsaiTree(ctx, x, y, trunkColor, leafColor, sizeFactor) { const windX = calculateWindOffset(animationTime, x, 0.7); ctx.translate(windX, 0); ctx.save(); ctx.translate(0, y + 60 * SCALE_FACTOR * sizeFactor); const trunk_len = 50 * SCALE_FACTOR * sizeFactor; const trunkGradient = ctx.createLinearGradient(-15 * SCALE_FACTOR * sizeFactor, 0, 15 * SCALE_FACTOR * sizeFactor, 0); trunkGradient.addColorStop(0, darkenColor(trunkColor, -0.1)); trunkGradient.addColorStop(0.5, trunkColor); trunkGradient.addColorStop(1, darkenColor(trunkColor, -0.3)); ctx.strokeStyle = trunkGradient; ctx.lineWidth = 15 * SCALE_FACTOR * sizeFactor; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -trunk_len); ctx.stroke(); function drawBranch(len, thickness) { if (len < 6) { ctx.fillStyle = leafColor; ctx.beginPath(); ctx.arc(0, 0, thickness * 2, 0, Math.PI * 2); ctx.fill(); return; } ctx.strokeStyle = darkenColor(trunkColor, -0.1); ctx.lineWidth = thickness; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -len); ctx.stroke(); ctx.translate(0, -len); for(let i = 0; i < 2; i++) { ctx.save(); const angle = i === 0 ? 0.5 : -0.5; ctx.rotate(angle + Math.sin(animationTime * 0.005 + len) * 0.05); drawBranch(len * 0.7, thickness * 0.8); ctx.restore(); } } ctx.translate(0, -trunk_len); drawBranch(30 * SCALE_FACTOR * sizeFactor, 4 * SCALE_FACTOR * sizeFactor); ctx.restore(); ctx.translate(-windX, 0); }
        function drawMushroomTree(ctx, x, y, trunkColor, capColor, sizeFactor) { const windX = calculateWindOffset(animationTime, x, 0.2); ctx.translate(windX, 0); const lineWidth = 30 * SCALE_FACTOR * sizeFactor; const y_cap = 40 * SCALE_FACTOR * sizeFactor; const radius = 50 * SCALE_FACTOR * sizeFactor; ctx.lineWidth = lineWidth; ctx.lineCap = 'round'; const trunkGradient = ctx.createLinearGradient(0, y + 60 * SCALE_FACTOR, 0, y - y_cap); trunkGradient.addColorStop(0, darkenColor(trunkColor, -0.1)); trunkGradient.addColorStop(1, trunkColor); ctx.strokeStyle = trunkGradient; ctx.beginPath(); ctx.moveTo(0, y + 60 * SCALE_FACTOR * sizeFactor); ctx.quadraticCurveTo(0 + 10 * SCALE_FACTOR, y + 20 * SCALE_FACTOR, 0, y - y_cap); ctx.stroke(); const capGradient = ctx.createRadialGradient(0 + radius * 0.3, y - y_cap - radius * 0.3, 5, 0, y - y_cap, radius); capGradient.addColorStop(0, '#FFFFFF99'); capGradient.addColorStop(0.5, capColor); capGradient.addColorStop(1, darkenColor(capColor, -0.4)); ctx.fillStyle = capGradient; ctx.beginPath(); ctx.arc(0, y - y_cap, radius, Math.PI, Math.PI * 2, false); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(0 - 20 * SCALE_FACTOR * sizeFactor, y - 50 * SCALE_FACTOR * sizeFactor, 5 * SCALE_FACTOR * sizeFactor, 0, Math.PI * 2); ctx.arc(0 + 10 * SCALE_FACTOR * sizeFactor, y - 60 * SCALE_FACTOR * sizeFactor, 7 * SCALE_FACTOR * sizeFactor, 0, Math.PI * 2); ctx.arc(0 + 30 * SCALE_FACTOR * sizeFactor, y - 45 * SCALE_FACTOR * sizeFactor, 4 * SCALE_FACTOR * sizeFactor, 0, Math.PI * 2); ctx.fill(); ctx.translate(-windX, 0); }
        function drawCrystalTree(ctx, x, y, trunkColor, crystalColor, sizeFactor) { const windX = calculateWindOffset(animationTime, x, 0.1); ctx.translate(windX, 0); const trunk_end = 20 * SCALE_FACTOR * sizeFactor; ctx.fillStyle = trunkColor; ctx.beginPath(); ctx.moveTo(0 - 10 * SCALE_FACTOR * sizeFactor, y + 60 * SCALE_FACTOR); ctx.lineTo(0 + 10 * SCALE_FACTOR * sizeFactor, y + 60 * SCALE_FACTOR); ctx.lineTo(0 + 5 * SCALE_FACTOR * sizeFactor, y - trunk_end); ctx.lineTo(0 - 5 * SCALE_FACTOR * sizeFactor, y - trunk_end); ctx.closePath(); ctx.fill(); for (let i = 0; i < 6; i++) { const crystalYOffset = Math.sin(animationTime * 0.005 + i) * 3 * SCALE_FACTOR; const size = (10 + Math.random() * 25) * SCALE_FACTOR * sizeFactor; const px = 0 + (Math.random() - 0.5) * 80 * SCALE_FACTOR; const py = y + (Math.random() - 0.5) * 80 * SCALE_FACTOR - 100 * SCALE_FACTOR + crystalYOffset; ctx.fillStyle = crystalColor + '80'; ctx.strokeStyle = crystalColor; ctx.lineWidth = 1 * SCALE_FACTOR; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + size, py + size * 0.5); ctx.lineTo(px + size * 0.7, py + size * 1.5); ctx.lineTo(px - size * 0.3, py + size * 0.8); ctx.closePath(); ctx.fill(); ctx.stroke(); } ctx.translate(-windX, 0); }
        function drawPixelTree(ctx, x, y, trunkColor, leafColor, sizeFactor) { const windX = calculateWindOffset(animationTime, x, 0.3); ctx.translate(windX, 0); const blockSize = 9 * SCALE_FACTOR * sizeFactor; const canopyShape = [[0, 1, 1, 1, 0], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [0, 1, 1, 1, 0]]; for (let row = 0; row < canopyShape.length; row++) { for (let col = 0; col < canopyShape[row].length; col++) { if (canopyShape[row][col] === 1) { ctx.fillStyle = leafColor; const rectX = 0 + (col - 2.5) * blockSize; const rectY = y + (row - canopyShape.length) * blockSize - 50 * SCALE_FACTOR * sizeFactor; ctx.fillRect(rectX, rectY, blockSize, blockSize); ctx.strokeStyle = darkenColor(leafColor, -0.2); ctx.strokeRect(rectX, rectY, blockSize, blockSize); } } } ctx.fillStyle = trunkColor; for (let i = 0; i < 6; i++) { ctx.fillRect(0 - blockSize / 2, y + i * blockSize, blockSize, blockSize); } ctx.translate(-windX, 0); }
        function drawSwirlyTree(ctx, x, y, trunkColor, leafColor, sizeFactor) { const windX = calculateWindOffset(animationTime, x, 0.4); ctx.translate(windX, 0); const trunk_len = 60 * SCALE_FACTOR * sizeFactor; ctx.save(); ctx.translate(0, y + trunk_len); ctx.strokeStyle = trunkColor; ctx.lineWidth = 15 * SCALE_FACTOR * sizeFactor; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -trunk_len); ctx.stroke(); ctx.translate(0, -trunk_len); for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4 + animationTime * 0.001); const sphereX = 30 * SCALE_FACTOR * sizeFactor; const sphereY = 0; const radius = (10 + i * 1) * SCALE_FACTOR * sizeFactor; const sphereGradient = ctx.createRadialGradient(sphereX + radius * 0.5, sphereY - radius * 0.5, 1, sphereX, sphereY, radius); sphereGradient.addColorStop(0, '#FFFFFFcc'); sphereGradient.addColorStop(1, leafColor); ctx.fillStyle = sphereGradient; ctx.beginPath(); ctx.arc(sphereX, sphereY, radius, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); ctx.translate(-windX, 0); }
        function drawDeadTree(ctx, x, y, trunkColor, _leafColor, sizeFactor) { const windX = calculateWindOffset(animationTime, x, 0.8); ctx.translate(windX, 0); const h_trunk = 60 * SCALE_FACTOR * sizeFactor; const w_base = 15 * SCALE_FACTOR * sizeFactor; const w_top = 5 * SCALE_FACTOR * sizeFactor; ctx.fillStyle = trunkColor; ctx.beginPath(); ctx.moveTo(0 - w_base, y + h_trunk); ctx.lineTo(0 + w_base, y + h_trunk); ctx.lineTo(0 + w_top, y - 50 * SCALE_FACTOR); ctx.lineTo(0 - w_top, y - 50 * SCALE_FACTOR); ctx.closePath(); ctx.fill(); ctx.strokeStyle = darkenColor(trunkColor, -0.4); ctx.lineWidth = 3 * SCALE_FACTOR * sizeFactor; for(let i = 0; i < 6; i++) { ctx.beginPath(); const branchX = 0 + (Math.random() - 0.5) * 10 * SCALE_FACTOR; const branchY = y - 30 * SCALE_FACTOR; ctx.moveTo(branchX, branchY); ctx.lineTo(branchX + (Math.random() - 0.5) * 80 * SCALE_FACTOR, y - (100 + Math.random() * 20) * SCALE_FACTOR); ctx.stroke(); } ctx.translate(-windX, 0); }
        const TREE_DRAW_FUNCTIONS = { 'SIMPLE': drawSimpleTree, 'PINE': drawPineTree, 'BONSAI': drawBonsaiTree, 'MUSHROOM': drawMushroomTree, 'CRYSTAL': drawCrystalTree, 'PIXEL': drawPixelTree, 'SWIRLY': drawSwirlyTree, 'DEAD': drawDeadTree };
        
        class BackgroundTree { 
            constructor(engine) { this.engine = engine; this.branches = []; this.generateTree(); } 
            generateTree() { this.branches = []; const initialBranch = { x: 0, y: 0, len: 70, angle: -Math.PI / 2, depth: 0, width: 7 }; this.branches.push(initialBranch); this.#grow(initialBranch, this.branches); } 
            #grow(branch, branchList) { const stack = [branch]; const maxDepth = 8; while (stack.length > 0) { const current = stack.pop(); if (current.depth >= maxDepth) continue; for (let i = 0; i < 2; i++) { const angle = current.angle + ((i === 0 ? 1 : -1) * (0.4 + Math.random() * 0.2)); const len = current.len * (0.75 + Math.random() * 0.05); const newBranch = { x: current.x + Math.cos(current.angle) * current.len, y: current.y + Math.sin(current.angle) * current.len, len, angle, depth: current.depth + 1, width: current.width * 0.7 }; branchList.push(newBranch); stack.push(newBranch); } } } 
            draw(ctx, time) { 
                const cyclePos = (time % CYCLE_DURATION) / CYCLE_DURATION; 
                const groundColor = this.engine.getInterpolatedColor(PALETTE.GROUND, cyclePos); 
                const trunkColor = `hsl(${groundColor.h - 30}, 20%, ${groundColor.l - 5}%)`; 
                const leafColor = `hsl(${groundColor.h}, 40%, ${groundColor.l + 20}%)`; 
                ctx.save(); 
                ctx.globalAlpha = 0.8; 
                ctx.translate(this.engine.width / 2, this.engine.height * HILL_TOP_Y_FACTOR); 
                ctx.strokeStyle = trunkColor; 
                ctx.lineCap = 'round'; 
                this.branches.forEach(b => { const sway = Math.sin(time * 0.0005 + b.depth) * 0.03 * (b.depth + 1); ctx.lineWidth = b.width; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + Math.cos(b.angle + sway) * b.len, b.y + Math.sin(b.angle + sway) * b.len); ctx.stroke(); }); 
                this.branches.filter(b => b.depth > 4).forEach(b => { const sway = Math.sin(time * 0.0005 + b.depth) * 0.03 * (b.depth + 1); const px = b.x + Math.cos(b.angle + sway) * b.len; const py = b.y + Math.sin(b.angle + sway) * b.len; ctx.fillStyle = leafColor; ctx.beginPath(); ctx.arc(px, py, 4 + Math.sin(time * 0.002 + b.depth) * 1, 0, Math.PI * 2); ctx.fill(); }); 
                ctx.restore(); 
            } 
        }

        class Plant { 
            constructor(type, x, y, level = 1, cost = PLANT_TYPES[type].cost) { this.type = type; this.x = x; this.y = y; this.level = level; this.cost = cost; } 
            draw(ctx, engine) { 
                const typeData = PLANT_TYPES[this.type]; if (!typeData) return; 
                const drawFunction = TREE_DRAW_FUNCTIONS[typeData.drawStyle]; 
                
                // ✅ CORREÇÃO: Efeito parallax removido para estabilizar as coordenadas
                const drawX = this.x;
                const drawY = this.y;

                const sizeFactor = 0.7 + this.level * 0.08; 
                if (drawFunction) { 
                    animationTime = engine.time; 
                    ctx.save(); 
                    ctx.translate(drawX, drawY - (35 * SCALE_FACTOR * sizeFactor)); 
                    ctx.shadowColor = typeData.color; 
                    ctx.shadowBlur = Math.min(30, 15 + this.level * 2); 
                    drawFunction(ctx, 0, 0, '#6A4E2B', typeData.color, sizeFactor); 
                    ctx.shadowBlur = 0; 
                    ctx.fillStyle = 'rgba(255,255,255,0.9)'; 
                    ctx.font = 'bold 10px Inter'; 
                    ctx.textAlign = 'center'; 
                    ctx.fillText(`L${this.level}`, 0, (60 * SCALE_FACTOR * sizeFactor) + 15); 
                    ctx.save(); 
                    ctx.translate(0, (65 * SCALE_FACTOR * sizeFactor)); 
                    const shadowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40 * SCALE_FACTOR * sizeFactor); 
                    shadowGradient.addColorStop(0, 'rgba(0,0,0,0.45)'); 
                    shadowGradient.addColorStop(1, 'rgba(0,0,0,0)'); 
                    ctx.fillStyle = shadowGradient; 
                    ctx.beginPath(); 
                    ctx.ellipse(0, 0, 42 * SCALE_FACTOR * sizeFactor, 14 * SCALE_FACTOR * sizeFactor, 0, 0, Math.PI * 2); 
                    ctx.fill(); 
                    ctx.restore(); 
                    ctx.restore(); 
                } 
                if(Math.random() < 0.008 + (this.level * 0.0005)){ 
                    engine.dustParticles.push(new DustParticle( drawX + (Math.random()-0.5)*30, drawY - 20 + (Math.random()-0.5)*30, 1.5 + Math.random()*2, typeData.color, (Math.random()-0.5)*0.05, -0.05 - Math.random()*0.05 )); 
                } 
            } 
            getState() { return { type: this.type, x: this.x, y: this.y, level: this.level, cost: this.cost }; } 
        }

        class Fauna { 
            constructor(type, x, y, life, speed, direction) { this.type = type; this.x = x; this.y = y; this.life = life; this.maxLife = life; this.speed = speed; this.direction = direction; this.size = type === 'BUTTERFLY' ? 10 : (type === 'GOLDEN_BUTTERFLY' ? 15 : 7); this.color = type === 'BUTTERFLY' ? PLANT_TYPES.TRUTH.color : (type === 'GOLDEN_BUTTERFLY' ? '#FFD700' : PLANT_TYPES.COURAGE.color); } 
            update(deltaTime, engine) { this.life -= deltaTime; this.x += Math.cos(this.direction) * this.speed * deltaTime / 16; this.y += Math.sin(this.direction) * this.speed * deltaTime / 16; if (Math.random() < 0.015) this.direction += (Math.random() - 0.5) * 0.5; if (this.x < 20 || this.x > engine.width - 20) this.direction = Math.PI - this.direction; if (this.y < 20 || this.y > engine.height - 20) this.direction = -this.direction; this.x = Math.min(Math.max(this.x, 20), engine.width - 20); this.y = Math.min(Math.max(this.y, 20), engine.height - 20); } 
            draw(ctx, engine) { 
                // ✅ CORREÇÃO: Efeito parallax removido para estabilizar as coordenadas
                const drawX = this.x;
                const drawY = this.y;
                
                ctx.save(); 
                ctx.translate(drawX, drawY); 
                const pulse = 1 + 0.12 * Math.sin(engine.time * 0.015); 
                ctx.scale(pulse, pulse); 
                ctx.shadowColor = this.color; 
                ctx.shadowBlur = this.type === 'GOLDEN_BUTTERFLY' ? 25 : (this.type === 'BUTTERFLY' ? 10 : 5); 
                if (this.type === 'BUTTERFLY' || this.type === 'GOLDEN_BUTTERFLY') { const wingColor = this.type === 'GOLDEN_BUTTERFLY' ? '#FFD700' : this.color; const bodyColor = '#795548'; const size = this.size; const wingFlap = Math.sin(engine.time * 0.02) * 0.1; ctx.fillStyle = wingColor; ctx.globalAlpha = 0.95; ctx.beginPath(); ctx.ellipse(-size * 0.4, -size * 0.5, size * 1.5, size * 0.8, -0.5 + wingFlap, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(size * 0.4, -size * 0.5, size * 1.5, size * 0.8, 0.5 - wingFlap, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = bodyColor; ctx.beginPath(); ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = this.type === 'GOLDEN_BUTTERFLY' ? '#9C27B0' : '#FFF'; ctx.font = '10px Inter'; ctx.textAlign = 'center'; ctx.fillText(this.type === 'GOLDEN_BUTTERFLY' ? '👑' : 'Luz', 0, 3); } else if (this.type === 'PEST') { const bodyColor = PLANT_TYPES.PATIENCE.color; const size = this.size; ctx.save(); ctx.rotate(Math.sin(engine.time * 0.005) * 0.1); for(let i=0; i<4; i++) { ctx.fillStyle = bodyColor; ctx.beginPath(); ctx.arc(i * size * 0.6 - size * 1.2, 0, size * 0.7, 0, Math.PI * 2); ctx.fill(); } ctx.fillStyle = '#4CAF50'; ctx.beginPath(); ctx.arc(size * 1.5, 0, size * 0.6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#FFF'; ctx.font = '10px Inter'; ctx.textAlign = 'center'; ctx.fillText('XP', 0, 3); ctx.restore(); } else { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI * 2); ctx.fill(); } 
                ctx.shadowBlur = 0; 
                ctx.globalAlpha = 1.0; 
                ctx.restore(); 
            } 
        }

        class DustParticle { 
            constructor(x, y, radius, color, speedX, speedY) { this.x = x; this.y = y; this.radius = radius; this.color = color; this.speedX = speedX; this.speedY = speedY; this.alpha = 1.0; this.life = 2000 + Math.random() * 3000; this.initialRadius = radius; } 
            update(deltaTime, engine) { this.x += this.speedX * deltaTime; this.y += this.speedY * deltaTime; this.alpha -= 0.0003 * deltaTime; this.life -= deltaTime; this.radius = this.initialRadius * (1 + 0.5 * Math.sin(engine.time * 0.01)); } 
            draw(ctx, engine) { 
                if (this.alpha <= 0) return; 
                ctx.save(); 
                ctx.globalAlpha = Math.max(0, this.alpha); 
                ctx.shadowColor = this.color; 
                ctx.shadowBlur = 5; 
                ctx.fillStyle = this.color; 
                ctx.beginPath(); 
                // ✅ CORREÇÃO: Efeito parallax removido para estabilizar as coordenadas
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); 
                ctx.fill(); 
                ctx.shadowBlur = 0; 
                ctx.globalAlpha = 1.0; 
                ctx.restore(); 
            } 
        }
        
        class FloatingText { constructor(x, y, text, color) { this.x = x; this.y = y; this.text = text; this.color = color; this.alpha = 1.0; this.velocityY = -1.0; this.life = 1500; } update(deltaTime) { this.y += this.velocityY * (deltaTime / 16); this.alpha -= 0.0006 * deltaTime; this.life -= deltaTime; } draw(ctx) { if (this.alpha <= 0) return; ctx.globalAlpha = this.alpha; ctx.font = 'bold 20px Inter'; ctx.fillStyle = this.color; ctx.shadowColor = 'black'; ctx.shadowBlur = 8; ctx.textAlign = 'center'; ctx.fillText(this.text, this.x, this.y); ctx.shadowBlur = 0; ctx.globalAlpha = 1.0; } }

        // ============================
        // GAME ENGINE
        // ============================
        class GameEngine {
            constructor(canvas, dpr = 1) {
                this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.dpr = dpr;
                this.gameState = {}; this.plants = []; this.fauna = []; this.dustParticles = []; this.floatingTexts = []; this.plantLevels = {};
                this.time = 0; this.tickAccumulator = 0; this.mousePosition = { x:0, y:0 };
                this.sellMode = false; this.selectedPlantType = null;
                
                this.resizeCanvas();
                window.addEventListener('resize', () => { this.resizeCanvas(); this.updateHUD(); });
                
                this.initializeState();
                this.initializeAudio();
                this.attachEvents();
               // this.initPlantSelectorScroll();
                this.renderPlantSelector(); 
            }

            resizeCanvas() {
                const container = this.canvas.parentElement;
                const rect = container.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                this.canvas.width = rect.width * dpr;
                this.canvas.height = rect.height * dpr;
                this.canvas.style.height = rect.height + 'px';
                this.canvas.style.width = rect.width + 'px';
                this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                this.width = rect.width;
                this.height = rect.height;
            }

            lerp(a,b,t){ return a + (b-a)*t; }
            getInterpolatedColor(palette, cyclePos) { for (let i=0;i<palette.length-1;i++){ const p1 = palette[i], p2=palette[i+1]; if (cyclePos >= p1.pos && cyclePos <= p2.pos){ const range = p2.pos - p1.pos; const t = (cyclePos - p1.pos)/range; return { h: this.lerp(p1.h,p2.h,t)%360, s: this.lerp(p1.s,p2.s,t), l: this.lerp(p1.l,p2.l,t) }; } } return palette[0]; }
            
            initializeState() { const INITIAL_STATE = { energy: 10, level: 1, eraId: 1, lastSave: Date.now(), firstPlay: true }; try { const savedState = JSON.parse(localStorage.getItem(GAME_STORAGE_KEY)); if (savedState && savedState.plants) { this.gameState = { ...INITIAL_STATE, ...savedState, firstPlay: false }; this.loadEntities(savedState); this.applyOfflineProgress(savedState.lastSave); } else { throw new Error("Save inválido"); } } catch (e) { this.gameState = INITIAL_STATE; this.loadInitialPlants(); this.showStory(); } Object.values(PLANT_TYPES).forEach(data => { this.plantLevels[data.id] = { level: data.baseLevel, cost: data.cost }; }); this.plants.forEach(p => { const data = PLANT_TYPES[p.type]; if(this.plantLevels[p.type]){ this.plantLevels[p.type].level = Math.max(this.plantLevels[p.type].level, p.level + 1); this.plantLevels[p.type].cost = Math.floor(data.cost * Math.pow(data.levelCostScale, p.level)); } }); this.backgroundTree = new BackgroundTree(this); this.updateHUD(); }
            applyOfflineProgress(lastSave) { const timeElapsed = Date.now() - lastSave; if (!lastSave || timeElapsed < 10000) return; const buffs = this.calculatePlantBuffs(); let idleGain = buffs.IDLE_GAIN + buffs.AUTO_COLLECT_RATE; const offlineEnergy = idleGain * this.gameState.eraId * (timeElapsed / 1000); if (offlineEnergy > 1) { this.gameState.energy += offlineEnergy; this.floatingTexts.push(new FloatingText(this.width / 2, this.height * 0.4, `+${Math.floor(offlineEnergy).toLocaleString('pt-BR')} (Offline)!`, '#ffee58')); } }
            loadInitialPlants() { this.plants.push(new Plant('PATIENCE', this.width * 0.5, this.height * 0.78)); }
            loadEntities(savedState) { if (savedState.plants) { this.plants = savedState.plants.map(p => new Plant(p.type, p.x, p.y, p.level, p.cost)).filter(p => PLANT_TYPES[p.type]); } this.fauna = []; }
            initializeAudio() { this.chimeSynth = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.1, release: 0.5 } }).toDestination(); }
            scheduleSave() { clearTimeout(this._saveTimeout); this._saveTimeout = setTimeout(() => this.saveGame(), SAVE_DEBOUNCE_MS); }
            saveGame() { const stateToSave = { ...this.gameState, plants: this.plants.map(p => p.getState()), lastSave: Date.now() }; try { localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(stateToSave)); } catch (e) { console.error("Erro ao salvar:", e); } }

            calculatePlantBuffs() { const buffs = { IDLE_GAIN: 0, FAUNA_REWARD: 0, FAUNA_LIFETIME: 0, CLICK_RADIUS: 0, CRITICAL_CHANCE: 0, AUTO_COLLECT_RATE: 0 }; buffs.AUTO_COLLECT_RATE = this.plants.length * 0.5; this.plants.forEach(plant => { const typeData = PLANT_TYPES[plant.type]; if (!typeData) return; const levelContribution = 1 + (plant.level * 0.1); if (typeData.buff === 'IDLE_GAIN') buffs.IDLE_GAIN += typeData.baseRate * levelContribution; if (typeData.buff === 'FAUNA_REWARD') buffs.FAUNA_REWARD += (5 * levelContribution); if (typeData.buff === 'FAUNA_LIFETIME') buffs.FAUNA_LIFETIME += (1500 * levelContribution); if (typeData.buff === 'CLICK_RADIUS') buffs.CLICK_RADIUS += (5 * levelContribution); if (typeData.buff === 'CRITICAL_CHANCE') buffs.CRITICAL_CHANCE += 0.005 * plant.level; }); return buffs; }
            calculateIdleGain(deltaTime) { let totalRatePerSecond = this.calculatePlantBuffs().IDLE_GAIN + this.calculatePlantBuffs().AUTO_COLLECT_RATE; totalRatePerSecond *= this.gameState.eraId; this.gameState.energy += totalRatePerSecond * (deltaTime / 1000); }
            gameTick(deltaTime) { this.calculateIdleGain(deltaTime); this.checkEraProgression(); this.spawnFauna(); this.scheduleSave(); this.updateHUD(); }
            
            checkEraProgression() {
                const nextEra = ERA_LEVELS.find(e => e.id === this.gameState.eraId + 1);
                if (nextEra && this.gameState.level >= nextEra.levelToUnlock) {
                    this.gameState.eraId = nextEra.id;
                    this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2, `🌟 Era da ${nextEra.name}!`, '#ff9800'));
                    this.chimeSynth.triggerAttackRelease("C6", "2n");
                    this.renderPlantSelector(); 
                    this.updateHUD();
                }
            }

            spawnFauna() { const maxFauna = 5 + this.gameState.eraId * 3; const spawnChance = 0.08 + (this.gameState.level / 5000); if (this.fauna.length >= maxFauna) return; let type = Math.random() < 0.005 ? 'GOLDEN_BUTTERFLY' : (Math.random() < 0.7 ? 'BUTTERFLY' : 'PEST'); if (Math.random() < spawnChance) { const life = 5000 + Math.random() * 5000; const speed = 0.8 + Math.random() * 0.8; const dir = Math.random() * Math.PI * 2; const finalLife = life + this.calculatePlantBuffs().FAUNA_LIFETIME; this.fauna.push(new Fauna(type, 50 + Math.random() * (this.width - 100), 50 + Math.random() * (this.height - 100), finalLife, speed, dir)); } }
            
            drawBackground() { 
                const ctx = this.ctx; ctx.clearRect(0, 0, this.width, this.height); 
                const t = this.time; 
                // ✅ CORREÇÃO: Efeito parallax removido do background para simplificar
                const pX = 0; // this.mousePosition.x; 
                const pY = 0; // this.mousePosition.y; 
                const cyclePos = (t % CYCLE_DURATION) / CYCLE_DURATION; 
                const skyTopColor = this.getInterpolatedColor(PALETTE.SKY_TOP, cyclePos); 
                const skyBottomColor = this.getInterpolatedColor(PALETTE.SKY_BOTTOM, cyclePos); 
                const groundColor = this.getInterpolatedColor(PALETTE.GROUND, cyclePos); 
                const skyGradient = ctx.createLinearGradient(0, 0, 0, this.height * 0.6); 
                skyGradient.addColorStop(0, `hsl(${skyTopColor.h}, ${skyTopColor.s}%, ${skyTopColor.l}%)`); 
                skyGradient.addColorStop(1, `hsl(${skyBottomColor.h}, ${skyBottomColor.s}%, ${skyBottomColor.l}%)`); 
                ctx.fillStyle = skyGradient; 
                ctx.fillRect(0, 0, this.width, this.height); 
                if (cyclePos < 0.25 || cyclePos > 0.75) { const moonArcPos = Math.min(1, Math.max(0, (cyclePos >= 0.75 ? cyclePos - 0.75 : cyclePos + 0.25) / 0.5)); const moonArcAngle = moonArcPos * Math.PI; const moonX = this.width * moonArcPos; const moonY = this.height * 0.85 - this.height * 0.7 * Math.sin(moonArcAngle); ctx.save(); ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(moonX, moonY, 40, 0, Math.PI * 2); ctx.fillStyle = '#f0f0c0'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0; ctx.restore(); } if (cyclePos >= 0.25 && cyclePos <= 0.75) { const visibleCyclePos = Math.min(1, Math.max(0, (cyclePos - 0.25) / 0.5)); const arcAngle = visibleCyclePos * Math.PI; const celestialX = this.width * visibleCyclePos; const celestialY = this.height * 0.85 - this.height * 0.7 * Math.sin(arcAngle); const sunColor = (cyclePos > 0.35 && cyclePos < 0.65) ? '#FFC107' : '#E91E63'; ctx.save(); ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(celestialX, celestialY, 45 + 5 * Math.sin(t * 0.002), 0, Math.PI * 2); ctx.fillStyle = sunColor; ctx.shadowColor = sunColor; ctx.shadowBlur = 35 + 5 * Math.sin(t * 0.003); ctx.fill(); ctx.shadowBlur = 0; ctx.restore(); } 
                for (let i = 0; i < 4; i++) { let x = (this.width + 100) - ((t * 0.03 + i * 150) % (this.width + 200)); x += pX * 25; const y = (this.height * 0.15 + i * 50) + pY * 15; ctx.save(); ctx.translate(x, y); ctx.globalAlpha = this.lerp(0.1, 0.6, Math.max(0, 1 - Math.abs(cyclePos - 0.5) * 2)); ctx.fillStyle = 'rgba(255, 255, 255, 1)'; const radius = 20 + i * 4; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.arc(radius * 0.6, radius * 0.2, radius * 0.8, 0, Math.PI * 2); ctx.arc(-radius * 0.6, radius * 0.2, radius * 0.9, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } 
                for (let i = 0; i < 3; i++) { const baseHeight = 0.6 + i*0.1; const parallaxFactor = 5 - i * 2; const depthLightness = groundColor.l + i * 3; ctx.fillStyle = `hsl(${groundColor.h}, ${groundColor.s}%, ${depthLightness}%)`; ctx.beginPath(); ctx.moveTo(-10, this.height * baseHeight); for (let x = -10; x < this.width + 10; x += 15) { const yOffset = Math.sin((x * 0.05) + (t * 0.001) + i) * (5 + i*3) + pY * parallaxFactor; ctx.lineTo(x, this.height * baseHeight + yOffset); } ctx.lineTo(this.width + 10, this.height); ctx.lineTo(-10, this.height); ctx.closePath(); ctx.fill(); } 
            }

            drawCanvas() { this.drawBackground(); if (this.backgroundTree) this.backgroundTree.draw(this.ctx, this.time); const cyclePos = (this.time % CYCLE_DURATION) / CYCLE_DURATION; const groundColor = this.getInterpolatedColor(PALETTE.GROUND, cyclePos); this.ctx.fillStyle = `hsl(${groundColor.h}, ${groundColor.s}%, ${groundColor.l}%)`; this.ctx.fillRect(0, this.height * 0.8, this.width, this.height * 0.2); this.dustParticles.forEach(p => p.draw(this.ctx, this)); this.plants.sort((a,b) => a.y - b.y).forEach(p => p.draw(this.ctx, this)); this.fauna.forEach(f => f.draw(this.ctx, this)); this.floatingTexts.forEach(t => t.draw(this.ctx, this)); }
            
            update(deltaTime) { this.time += deltaTime; this.fauna = this.fauna.filter(f => f.life > 0); this.fauna.forEach(f => f.update(deltaTime, this)); this.dustParticles = this.dustParticles.filter(p => p.life > 0 && p.alpha > 0); this.dustParticles.forEach(p => p.update(deltaTime, this)); this.floatingTexts = this.floatingTexts.filter(t => t.life > 0); this.floatingTexts.forEach(t => t.update(deltaTime)); this.tickAccumulator += deltaTime; if (this.tickAccumulator >= 1000) { this.gameTick(this.tickAccumulator); this.tickAccumulator = 0; } }

            updateHUD() {
                const buffs = this.calculatePlantBuffs();
                const currentEra = ERA_LEVELS.find(e => e.id === this.gameState.eraId) || ERA_LEVELS[0];
                const nextEra = ERA_LEVELS.find(e => e.id === this.gameState.eraId + 1);
                document.getElementById('energy-display').textContent = Math.floor(this.gameState.energy).toLocaleString('pt-BR'); 
                document.getElementById('level-display').textContent = Math.floor(this.gameState.level).toLocaleString('pt-BR');
                document.getElementById('era-display').textContent = currentEra.name;
                document.getElementById('auto-collect-rate').textContent = (buffs.AUTO_COLLECT_RATE + buffs.IDLE_GAIN).toFixed(1);
                document.getElementById('plant-count-display').textContent = `${this.plants.length} / ${PLANT_LIMIT}`;
                const cyclePos = (this.time % CYCLE_DURATION) / CYCLE_DURATION;
                document.getElementById('energy-icon').textContent = (cyclePos < 0.25 || cyclePos > 0.75) ? '🌙' : '☀️';
                let progress = 0; let targetLevel = 1; 
                if (nextEra) { const currentLevel = this.gameState.level; const required = nextEra.levelToUnlock; const prevRequired = currentEra.levelToUnlock; targetLevel = required; if (currentLevel >= required) { progress = 100; } else { progress = Math.min(100, ((currentLevel - prevRequired) / (required - prevRequired)) * 100); } } else { progress = 100; targetLevel = this.gameState.level; }
                document.getElementById('era-progress-bar').style.width = `${progress}%`; 
                document.getElementById('era-progress-label').textContent = `${Math.floor(progress)}% (Próximo: Nv ${targetLevel})`;
                const sellButton = document.getElementById('sell-mode-button'); 
                if (this.sellMode) { sellButton.classList.add('bg-red-600', 'sell-active-visual'); sellButton.textContent = 'Modo Venda ATIVO'; } else { sellButton.classList.remove('bg-red-600', 'sell-active-visual'); sellButton.textContent = 'Ativar Modo Venda'; }
                this.renderBuyButton(); 
            }

            renderPlantSelector() { const container = document.getElementById('plant-selector'); const oldScroll = container.scrollLeft || 0; let content = ''; Object.keys(PLANT_TYPES).forEach(key => { const data = PLANT_TYPES[key]; let isUnlocked = ERA_LEVELS.some(e => e.id <= this.gameState.eraId && e.unlockedPlants.includes(key)); const isActive = this.selectedPlantType === key; content += `<button class="plant-preview-button hud-button ${isActive ? 'active' : ''}" ${!isUnlocked ? 'disabled' : ''} onclick="gameEngine.selectPlantType('${key}')"><span class="text-3xl">${data.symbol}</span><span class="text-xs font-semibold">${data.name}</span></button>`; }); if (container.innerHTML !== content) { container.innerHTML = content; container.scrollLeft = oldScroll; this.initPlantSelectorScroll(); } }
            renderBuyButton() { const button = document.getElementById('buy-plant-button'); if (this.selectedPlantType) { const plantLevelData = this.plantLevels[this.selectedPlantType]; const currentCost = plantLevelData.cost; const canAfford = this.gameState.energy >= currentCost; const canPlant = this.plants.length < PLANT_LIMIT; button.disabled = !canAfford || !canPlant; if (!canPlant) { button.textContent = 'LIMITE ATINGIDO'; } else { button.innerHTML = `PLANTAR (${Math.floor(currentCost).toLocaleString('pt-BR')} <span class="text-yellow-200">${(this.time % CYCLE_DURATION) / CYCLE_DURATION > 0.5 ? '☀️' : '🌙'}</span>)`; } } else { button.disabled = true; button.textContent = 'SELECIONE UMA SEMENTE'; } }

            attachEvents() { this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e)); this.canvas.addEventListener('mousemove', (e) => { const rect = this.canvas.getBoundingClientRect(); this.mousePosition.x = ((e.clientX - rect.left) / rect.width) - 0.5; this.mousePosition.y = ((e.clientY - rect.top) / rect.height) - 0.5; }); }
            
            initPlantSelectorScroll() {
                const container = document.getElementById('plant-selector');
                if (!container) return;

                container.replaceWith(container.cloneNode(true)); // limpa listeners antigos
                const newContainer = document.getElementById('plant-selector');
                
                let isDown = false;
                let startX;
                let scrollLeft;
                let isDragging = false; 

                const startDragging = (e) => {
                    isDown = true;
                    isDragging = false;
                    newContainer.classList.add('active');
                    const rect = newContainer.getBoundingClientRect();
                    startX = (e.pageX || e.touches[0].pageX) - rect.left;
                    scrollLeft = newContainer.scrollLeft;
                 };


                const stopDragging = () => {
                    isDown = false;
                    newContainer.classList.remove('active');
                    setTimeout(() => { isDragging = false; }, 50);
                 };

                const onDrag = (e) => {
                    if (!isDown) return;
                    e.preventDefault();
                    isDragging = true;
                    const rect = newContainer.getBoundingClientRect();
                    const x = (e.pageX || e.touches[0].pageX) - rect.left;
                    const walk = (x - startX) * 1.5;
                    newContainer.scrollLeft = scrollLeft - walk;
                };

                newContainer.addEventListener('mousedown', startDragging);
                newContainer.addEventListener('touchstart', startDragging, { passive: true });
                window.addEventListener('mouseup', stopDragging);
                window.addEventListener('mouseleave', stopDragging);
                window.addEventListener('touchend', stopDragging);
                window.addEventListener('touchcancel', stopDragging);
                newContainer.addEventListener('mousemove', onDrag);
                newContainer.addEventListener('touchmove', onDrag, { passive: false });
                newContainer.addEventListener('click', (e) => {

                    if (isDragging) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }, true);
            }

            toggleSettings() { document.getElementById('settings-modal').classList.toggle('hidden'); }
            showStory() { document.getElementById('story-modal').classList.remove('hidden'); }
            hideStory() { document.getElementById('story-modal').classList.add('hidden'); this.gameState.firstPlay = false; this.saveGame(); }
            
            sellPlant(plantIndex, mouseX, mouseY) { const plant = this.plants[plantIndex]; const typeData = PLANT_TYPES[plant.type]; const refundAmount = Math.floor(plant.cost * SELL_REFUND_PERCENTAGE); this.gameState.energy += refundAmount; const plantLevelData = this.plantLevels[plant.type]; if (plantLevelData.level > 1) { plantLevelData.level -= 1; plantLevelData.cost = Math.floor(plantLevelData.cost / typeData.levelCostScale); } this.plants.splice(plantIndex, 1); this.floatingTexts.push(new FloatingText(mouseX, mouseY, `VENDIDO! +${refundAmount} Luz`, '#ff6347')); this.chimeSynth.triggerAttackRelease("A3", "16n"); this.updateHUD(); this.scheduleSave(); }
            massSellByLevel(level) { const plantsToSell = this.plants.filter(p => p.level === level); if (plantsToSell.length === 0) { this.floatingTexts.push(new FloatingText(this.width / 2, this.height * 0.5, `Nenhuma Planta Nv ${level} encontrada!`, '#ffcc00')); this.chimeSynth.triggerAttackRelease("C4", "32n"); return; } let totalRefund = 0; for (let i = this.plants.length - 1; i >= 0; i--) { const plant = this.plants[i]; if (plant.level === level) { const typeData = PLANT_TYPES[plant.type]; totalRefund += Math.floor(plant.cost * SELL_REFUND_PERCENTAGE); const plantLevelData = this.plantLevels[plant.type]; if (plantLevelData.level > 1) { plantLevelData.level -= 1; plantLevelData.cost = Math.floor(plantLevelData.cost / typeData.levelCostScale); } this.plants.splice(i, 1); } } this.gameState.energy += totalRefund; this.floatingTexts.push(new FloatingText(this.width / 2, this.height * 0.5, `Vendido ${plantsToSell.length} Nv ${level}! +${totalRefund} Luz`, '#ff6347')); this.chimeSynth.triggerAttackRelease("A3", "8n"); this.updateHUD(); this.scheduleSave(); }
            toggleSellMode() { this.sellMode = !this.sellMode; this.updateHUD(); }
            
            handleCanvasClick(event) { if (Tone.context.state !== 'running') { Tone.start(); } const rect = this.canvas.getBoundingClientRect(); const scaleX = this.canvas.width / rect.width; const scaleY = this.canvas.height / rect.height; const mouseX = (event.clientX - rect.left) * scaleX / this.dpr; const mouseY = (event.clientY - rect.top) * scaleY / this.dpr; const buffs = this.calculatePlantBuffs(); const clickRadius = 25 + buffs.CLICK_RADIUS; let plantClickedIndex = -1; for (let i = 0; i < this.plants.length; i++) { if (Math.hypot(this.plants[i].x - mouseX, this.plants[i].y - mouseY) < 40) { plantClickedIndex = i; break; } } if (this.sellMode && plantClickedIndex !== -1) { this.sellPlant(plantClickedIndex, mouseX, mouseY); this.toggleSellMode(); return; } for (let i = this.fauna.length - 1; i >= 0; i--) { const f = this.fauna[i]; if (Math.hypot(f.x - mouseX, f.y - mouseY) < clickRadius) { let energyGained = 0; let text = ''; let color = ''; const baseReward = 20 + buffs.FAUNA_REWARD; const isCritical = Math.random() < buffs.CRITICAL_CHANCE; if (f.type === 'GOLDEN_BUTTERFLY') { energyGained = baseReward * 50; text = `TESOURO! +${Math.floor(energyGained)}`; color = '#FFD700'; this.chimeSynth.triggerAttackRelease("E6", "8n"); } else if (f.type === 'BUTTERFLY') { energyGained = isCritical ? baseReward * 5 : baseReward; text = isCritical ? `CRIT! +${Math.floor(energyGained)}` : `+${Math.floor(energyGained)}`; color = isCritical ? PLANT_TYPES.BEAUTY.color : PLANT_TYPES.TRUTH.color; this.chimeSynth.triggerAttackRelease(isCritical ? "C6" : "G5", "8n"); } else if (f.type === 'PEST') { this.gameState.level += 1; text = `+1 Essência`; color = PLANT_TYPES.PATIENCE.color; this.chimeSynth.triggerAttackRelease("D4", "16n"); } this.fauna.splice(i, 1); if (energyGained > 0 || text) { this.gameState.energy += energyGained; this.floatingTexts.push(new FloatingText(mouseX, mouseY, text, color)); } this.updateHUD(); this.scheduleSave(); return; } } if (plantClickedIndex !== -1) { const p = this.plants[plantClickedIndex]; const clickReward = 3 + p.level * 3; this.gameState.energy += clickReward; this.floatingTexts.push(new FloatingText(mouseX, mouseY, `+${clickReward}`, PLANT_TYPES.WISDOM.color)); this.chimeSynth.triggerAttackRelease("A4", "16n"); for(let i=0; i<3; i++) { this.dustParticles.push(new DustParticle( p.x + (Math.random()-0.5)*15, p.y + (Math.random()-0.5)*15, 1.5 + Math.random()*1, PLANT_TYPES[p.type].color, (Math.random()-0.5)*0.1, -0.1 - Math.random()*0.1 )); } this.updateHUD(); this.scheduleSave(); return; } this.gameState.energy += 1; this.floatingTexts.push(new FloatingText(mouseX, mouseY, '+1', '#cccccc')); this.chimeSynth.triggerAttackRelease("G4", "16n"); this.updateHUD(); this.scheduleSave(); }

            selectPlantType(type) { this.selectedPlantType = type; this.updateHUD(); }
            buySelectedPlant() {
                if(this.selectedPlantType) this.buyPlant(this.selectedPlantType);
            }
            buyPlant(plantType) {
                const data = PLANT_TYPES[plantType]; const plantLevelData = this.plantLevels[plantType]; const currentCost = plantLevelData.cost;
                if (this.gameState.energy >= currentCost && this.plants.length < PLANT_LIMIT) {
                    this.gameState.energy -= currentCost;
                    let newX, newY, tries = 0, validPosition = false;
                    
                    const hudBottom = document.querySelector('.hud-bottom');
                    const hudHeight = hudBottom ? hudBottom.getBoundingClientRect().height : 120;
                    const plantZoneTop = this.height * 0.75; 
                    const plantZoneBottom = this.height - hudHeight - 40;

                    while (tries < 100 && !validPosition) { 
                        newX = 50 + Math.random() * (this.width - 100); 
                        newY = plantZoneTop + Math.random() * (plantZoneBottom - plantZoneTop);
                        if (!this.plants.some(p => Math.hypot(p.x - newX, p.y - newY) < 80)) { 
                            validPosition = true; 
                        } 
                        tries++; 
                    }

                    this.plants.push(new Plant(plantType, newX, newY, plantLevelData.level, currentCost));
                    plantLevelData.cost = Math.floor(currentCost * data.levelCostScale); plantLevelData.level += 1;
                    this.gameState.level += data.levelBonus;
                    this.floatingTexts.push(new FloatingText(this.width / 2, this.height * 0.9, `+${data.levelBonus} Essência!`, '#4ade80'));
                    this.updateHUD(); this.scheduleSave(); this.chimeSynth.triggerAttackRelease("F5", "4n");
                } else {
                    this.updateHUD();
                }
            }

            startLoop() { let lastTime = 0; const loop = (time) => { if (!lastTime) lastTime = time; const delta = Math.min(time - lastTime, 100); lastTime = time; this.update(delta); this.drawCanvas(); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
        }

        // ============================
        // INICIALIZAÇÃO DO JOGO
        // ============================
        let gameEngine = null;
        window.addEventListener('load', () => { 
            const canvas = document.getElementById('garden-canvas'); const dpr = window.devicePixelRatio || 1;
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
            gameEngine = new GameEngine(canvas, dpr);
            gameEngine.startLoop();
        });