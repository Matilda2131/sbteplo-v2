// ==================== КАСТОМНЫЙ КУРСОР ====================
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX - 4 + 'px';
    cursorDot.style.top = mouseY - 4 + 'px';
});

function animateRing() {
    ringX += (mouseX - ringX) * 0.35;
    ringY += (mouseY - ringY) * 0.35;
    cursorRing.style.left = ringX - 20 + 'px';
    cursorRing.style.top = ringY - 20 + 'px';
    requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, button, .calc-tab, .result-folder summary, .portfolio-item, input, select').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
});

// ==================== ПРЕЛОАДЕР ====================
window.addEventListener('load', () => {
    setTimeout(() => { document.getElementById('preloader').classList.add('hidden'); }, 2200);
});

// ==================== НАВИГАЦИЯ ====================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.add('open');
});
function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('open');
}

// ==================== REVEAL АНИМАЦИИ ====================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale').forEach(el => observer.observe(el));

// ==================== АНИМИРОВАННЫЕ СЧЁТЧИКИ ====================
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target);
            let current = 0;
            const increment = target / 60;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) { current = target; clearInterval(timer); }
                el.textContent = Math.floor(current).toLocaleString('ru-RU');
                if (target === 100) el.textContent = Math.floor(current) + '%';
                if (target === 5) el.textContent = Math.floor(current) + ' лет';
                if (target === 40) el.textContent = Math.floor(current) + '+';
                if (target === 500) el.textContent = Math.floor(current).toLocaleString('ru-RU');
            }, 30);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

// ==================== КАЛЬКУЛЯТОР - СТУПЕНИ ====================
let currentStep = 1;
let houseStructureCalc = [];

// ==================== ЭТАЖИ И КОМНАТЫ ====================
function renderFloorsCalc() {
    const floorsCount = parseInt(document.getElementById('floorsCountCalc').value);
    const container = document.getElementById('floorsContainerCalc');
    container.innerHTML = '';
    houseStructureCalc = [];
    
    if (isNaN(floorsCount) || floorsCount < 1) {
        calculateProjectTotalsCalc();
        return;
    }
    
    for (let i = 1; i <= floorsCount; i++) {
        const floorData = { floor: i, rooms: [] };
        const floorDiv = document.createElement('div');
        floorDiv.className = 'bg-dark-950/50 border border-dark-800 rounded-2xl p-6';
        let roomsHtml = '';
        for (let j = 1; j <= 5; j++) {
            floorData.rooms.push({ id: j, area: 0, active: true });
            roomsHtml += createRoomInputHtml(i, j, 0, true);
        }
        houseStructureCalc.push(floorData);
        floorDiv.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <h4 class="gold-text font-bold text-lg">Этаж ${i}</h4>
                <div class="flex items-center gap-3">
                    <label class="text-dark-400 text-sm">Комнат:</label>
                    <select id="floor-${i}-rooms-count-calc" class="premium-select w-24 text-sm py-2" onchange="updateFloorRoomsCalc(${i})">
                        ${[1,2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}">${n}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div id="floor-${i}-rooms-list-calc" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">${roomsHtml}</div>`;
        container.appendChild(floorDiv);
    }
    calculateProjectTotalsCalc();
}

function createRoomInputHtml(floorIdx, roomIdx, areaVal, isActive) {
    return `<div class="flex items-center gap-3 bg-dark-900/50 p-3 rounded-xl border border-dark-800 hover:border-dark-700 transition-all">
        <input type="checkbox" id="floor-${floorIdx}-room-${roomIdx}-active-calc" ${isActive?'checked':''} class="w-4 h-4 accent-gold-500 rounded cursor-pointer" onchange="calculateProjectTotalsCalc()">
        <label class="text-dark-300 text-sm flex-1 cursor-pointer" for="floor-${floorIdx}-room-${roomIdx}-active-calc">Комната ${roomIdx}</label>
        <input aria-label="м²" type="number" id="floor-${floorIdx}-room-${roomIdx}-area-calc" value="${areaVal}" placeholder="м²" min="0" max="300" class="premium-input area-input-calc w-20 px-2 py-2 text-sm text-right" oninput="calculateProjectTotalsCalc()" onfocus="this.select()" onkeydown="if(event.key==='Enter'){event.preventDefault();moveToNextAreaCalc(this);}">
        <span class="text-dark-500 text-sm">м²</span>
    </div>`;
}

function updateFloorRoomsCalc(floorIdx) {
    const count = parseInt(document.getElementById(`floor-${floorIdx}-rooms-count-calc`).value);
    const listContainer = document.getElementById(`floor-${floorIdx}-rooms-list-calc`);
    const currentRooms = houseStructureCalc[floorIdx - 1].rooms;
    const newRooms = [];
    for (let j = 1; j <= count; j++) {
        const existing = currentRooms.find(r => r.id === j);
        newRooms.push({ id: j, area: existing ? existing.area : 0, active: existing ? existing.active : true });
    }
    houseStructureCalc[floorIdx - 1].rooms = newRooms;
    let roomsHtml = '';
    newRooms.forEach(room => { roomsHtml += createRoomInputHtml(floorIdx, room.id, room.area, room.active); });
    listContainer.innerHTML = roomsHtml;
    calculateProjectTotalsCalc();
}

function toggleAdvancedCalc() {
    const box = document.getElementById('advancedOptionsCalc');
    const btn = document.getElementById('advancedToggleCalc');
    const isHidden = box.classList.toggle('hidden');
    btn.textContent = isHidden ? 'Показать детали настройки ▾' : 'Скрыть детали настройки ▴';
}

function autoFillAreaCalc() {
    const declared = parseFloat(document.getElementById('totalHouseAreaCalc').value) || 0;
    const floorsCount = houseStructureCalc.length;
    const warningEl = document.getElementById('areaWarningCalc');
    if (declared <= 0 || floorsCount === 0) {
        warningEl.textContent = 'Сначала впишите общую площадь дома и выберите этажность.';
        warningEl.classList.remove('hidden');
        return;
    }
    const perFloor = Math.floor(declared / floorsCount);
    houseStructureCalc.forEach((floor, fIdx) => {
        const isLast = fIdx === houseStructureCalc.length - 1;
        const floorArea = isLast ? (declared - perFloor * (floorsCount - 1)) : perFloor;
        floor.rooms.forEach((room, rIdx) => {
            const areaVal = rIdx === 0 ? floorArea : 0;
            const areaInput = document.getElementById(`floor-${fIdx + 1}-room-${room.id}-area-calc`);
            const activeInput = document.getElementById(`floor-${fIdx + 1}-room-${room.id}-active-calc`);
            if (areaInput) areaInput.value = areaVal;
            if (activeInput) activeInput.checked = true;
        });
    });
    calculateProjectTotalsCalc();
}

function calculateProjectTotalsCalc() {
    let totalCalcArea = 0;
    houseStructureCalc.forEach((floor, fIdx) => {
        let floorArea = 0;
        floor.rooms.forEach((room, rIdx) => {
            const isActive = document.getElementById(`floor-${fIdx+1}-room-${room.id}-active-calc`).checked;
            const area = parseFloat(document.getElementById(`floor-${fIdx+1}-room-${room.id}-area-calc`).value) || 0;
            houseStructureCalc[fIdx].rooms[rIdx].active = isActive;
            houseStructureCalc[fIdx].rooms[rIdx].area = area;
            if (isActive) floorArea += area;
        });
        houseStructureCalc[fIdx].calculatedArea = floorArea;
        totalCalcArea += floorArea;
    });
    document.getElementById('calculatedTotalAreaCalc').textContent = totalCalcArea;
    validateAreaCalc(totalCalcArea);
}

function moveToNextAreaCalc(current) {
    const inputs = Array.from(document.querySelectorAll('input[id$="-area-calc"]'));
    const idx = inputs.indexOf(current);
    if (idx !== -1 && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
    } else {
        current.blur();
    }
}

function validateAreaCalc(currentTotal) {
    const declared = parseFloat(document.getElementById('totalHouseAreaCalc').value) || 0;
    const calc = currentTotal !== undefined ? currentTotal : parseFloat(document.getElementById('calculatedTotalAreaCalc').textContent) || 0;
    const warningEl = document.getElementById('areaWarningCalc');
    if (declared > 0 && calc === 0) {
        warningEl.textContent = 'Заполните площадь хотя бы одной комнаты ниже. Расчёт сметы идёт по ней, а не по общей площади дома.';
        warningEl.classList.remove('hidden');
    } else if (declared > 0 && calc > 0) {
        const diff = Math.abs(declared - calc) / declared;
        warningEl.textContent = 'Сумма площадей комнат отличается более чем на 5%.';
        warningEl.classList.toggle('hidden', diff <= 0.05);
    } else {
        warningEl.classList.add('hidden');
    }
}

// ==================== ФОРМАТИРОВАНИЕ ====================
const PREMIUM_MARKUP = 1.15;
function formatRubricCalc(num) { return Math.round(num).toLocaleString('ru-RU') + ' ₽'; }

function createFolderCalc(title, iconSvg, items, isOpen = false) {
    const itemsHtml = items.map(item => `
        <div class="flex justify-between items-center py-2.5 border-b border-dark-800/50 last:border-0">
            <span class="text-dark-400 text-sm">${item.label}</span>
            <span class="text-dark-100 font-semibold text-sm text-right">${item.value}</span>
        </div>`).join('');
    return `
        <details class="result-folder" ${isOpen?'open':''}>
            <summary>
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 flex-shrink-0">${iconSvg}</div>
                    <span class="text-base font-bold text-white">${title}</span>
                </div>
                <svg class="w-5 h-5 text-gold-400 chevron-icon flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </summary>
            <div class="folder-body"><div class="space-y-1">${itemsHtml}</div></div>
        </details>`;
}

const icons = {
    mat: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>',
    tool: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
    chart: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>'
};

// ==================== ВКЛАДКИ РЕЗУЛЬТАТОВ ====================
let currentResultTab = 0;

function switchResultTab(tabIndex) {
    currentResultTab = tabIndex;
    document.querySelectorAll('[data-result-tab]').forEach((btn, idx) => {
        if (idx === tabIndex) { btn.classList.add('active'); btn.classList.remove('bg-dark-900/60'); }
        else { btn.classList.remove('active'); btn.classList.add('bg-dark-900/60'); }
    });
    document.querySelectorAll('.result-panel').forEach((panel, idx) => {
        panel.classList.toggle('hidden', idx !== tabIndex);
    });
}

// ==================== ТЁПЛЫЕ ПОЛЫ ====================
function calculateFloorCalc() {
    const pipeStep = parseInt(document.getElementById('floorPipeStepCalc').value);
    const hasAutomation = document.getElementById('floorAutomationCalc').value === 'yes';
    const installMethod = document.getElementById('floorInstallMethodCalc').value;
    
    let wPerM2Calc = pipeStep === 10 ? 145 : pipeStep === 15 ? 115 : 90;
    let workPricePerM2Calc, methodNameCalc, insulationPriceCalc, baseMaterialPriceCalc;
    
    if (installMethod === 'mats') {
        workPricePerM2Calc = 850; methodNameCalc = 'Профильные маты (быстрый монтаж)'; insulationPriceCalc = 0; baseMaterialPriceCalc = 550;
    } else if (installMethod === 'mesh') {
        workPricePerM2Calc = 1300; methodNameCalc = 'Пенополистирол 50мм, плёнка, монтажная сетка'; insulationPriceCalc = 450; baseMaterialPriceCalc = 350;
    } else {
        workPricePerM2Calc = 1100; methodNameCalc = 'Пенополистирол 50мм, плёнка, якорные скобы'; insulationPriceCalc = 450; baseMaterialPriceCalc = 200;
    }

    let totalPipeLen = 0, totalContours = 0, roomBreakdownItems = [];
    houseStructureCalc.forEach(floor => {
        if (floor.calculatedArea > 0) {
            const pipeLen = Math.ceil(floor.calculatedArea * (100 / pipeStep));
            totalPipeLen += pipeLen;
            (floor.rooms || []).forEach(room => {
                if (room.active && room.area > 0) {
                    const roomContours = Math.max(1, Math.ceil(room.area / 15));
                    const roomPowerW = Math.round(room.area * wPerM2Calc);
                    totalContours += roomContours;
                    roomBreakdownItems.push({
                        label: `Этаж ${floor.floor}, помещение ${room.id} (${room.area} м²)`,
                        value: `${roomContours} конт. | ${roomPowerW} Вт`
                    });
                }
            });
        }
    });

    const activeArea = houseStructureCalc.reduce((sum, f) => sum + (f.calculatedArea || 0), 0);
    const totalPowerKwCalc = ((activeArea * wPerM2Calc) / 1000).toFixed(1);
    const totalWorkCalc = Math.round(activeArea * workPricePerM2Calc * PREMIUM_MARKUP);
    const pipeMaterialCostCalc = totalPipeLen * 100;
    const insulationMaterialCostCalc = activeArea * insulationPriceCalc;
    const baseMaterialCostCalc = activeArea * baseMaterialPriceCalc;
    const collectorCountCalc = Math.max(1, Math.ceil(totalContours / 6));
    const collectorCostCalc = collectorCountCalc * 22000;
    let automationCostCalc = hasAutomation ? totalContours * (5500 + 8000) : 0;
    
    const totalMaterialsCalc = pipeMaterialCostCalc + insulationMaterialCostCalc + baseMaterialCostCalc + collectorCostCalc + automationCostCalc;
    const grandTotalCalc = totalMaterialsCalc + totalWorkCalc;

    const folderRooms = roomBreakdownItems.length ? createFolderCalc('Разбивка по помещениям', icons.chart, roomBreakdownItems, false) : '';

    const folder1 = createFolderCalc('Материалы и оборудование', icons.mat, [
        { label: 'Способ укладки', value: methodNameCalc },
        { label: 'Труба PEX-a (Rehau/Uponor)', value: `${totalPipeLen} м.п. (${formatRubricCalc(pipeMaterialCostCalc)})` },
        { label: 'Утеплитель и основание', value: formatRubricCalc(insulationMaterialCostCalc + baseMaterialCostCalc) },
        { label: `Коллекторные узлы (${collectorCountCalc} шт.)`, value: formatRubricCalc(collectorCostCalc) },
        ...(hasAutomation ? [{ label: 'Покомнатная автоматика', value: `${totalContours} конт. × 13 500 ₽ (${formatRubricCalc(automationCostCalc)})` }] : [])
    ], false);

    const folder2 = createFolderCalc('Итоговая цена работ', icons.tool, [
        { label: 'Работа по укладке основания и трубы', value: `${activeArea} м² × ${workPricePerM2Calc} ₽` },
        { label: 'Монтаж коллектора и пуско-наладка', value: formatRubricCalc(collectorCountCalc * 5000 + (hasAutomation ? totalContours * 1500 : 0)) }
    ], false);

    const folder3 = createFolderCalc('Итоговая сводка', icons.chart, [
        { label: 'Теплоотдача системы', value: `<span class="text-gold-400 font-bold">~${wPerM2Calc} Вт/м² (всего ${totalPowerKwCalc} кВт)</span>` },
        { label: 'Итого материалы', value: `<span class="text-gold-400 font-bold">${formatRubricCalc(totalMaterialsCalc)}</span>` },
        { label: 'Итого монтажные работы', value: `<span class="text-gold-400 font-bold">${formatRubricCalc(totalWorkCalc)}</span>` },
        { label: 'Общая стоимость', value: `<span class="text-2xl font-bold gold-text">${formatRubricCalc(grandTotalCalc)}</span>` },
        { label: 'Стоимость за м²', value: `${activeArea > 0 ? Math.round(grandTotalCalc/activeArea).toLocaleString('ru-RU') : '0'} ₽/м²` }
    ], true);

    const fullHtml = `
        <details class="result-folder" open>
            <summary>
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 flex-shrink-0">${icons.chart}</div>
                    <span class="text-base font-bold text-white">Тёплые полы</span>
                </div>
                <span class="text-lg font-bold gold-text">${formatRubricCalc(grandTotalCalc)}</span>
            </summary>
            <div class="folder-body">
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-2.5 border-b border-dark-800/50">
                        <span class="text-dark-400 text-sm">Материалы</span>
                        <span class="text-dark-100 font-semibold text-sm">${formatRubricCalc(totalMaterialsCalc)}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5 border-b border-dark-800/50">
                        <span class="text-dark-400 text-sm">Монтажные работы</span>
                        <span class="text-dark-100 font-semibold text-sm">${formatRubricCalc(totalWorkCalc)}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5">
                        <span class="text-white font-bold">ИТОГО</span>
                        <span class="text-xl font-bold gold-text">${formatRubricCalc(grandTotalCalc)}</span>
                    </div>
                </div>
            </div>
        </details>
        ${folderRooms}
        ${folder1}
        ${folder2}
        ${folder3}
        <div class="mt-3 p-4 rounded-xl bg-dark-950/50 border border-dark-800 text-dark-500 text-xs leading-relaxed">
            Расчёт мощности сделан для стандартных условий: −22 °C на улице, +21 °C внутри помещения, температура поверхности пола +22 °C. Один контур — не более 80 м трубы. Материал напольного покрытия (плитка, ламинат и т.д.) в расчёте не учитывается — уточняется на замере. Точная смета формируется после выезда специалиста.
        </div>`;

    document.getElementById('resultPanel-0').innerHTML = fullHtml;
    return { total: grandTotalCalc, area: activeArea };
}

// ==================== РАДИАТОРЫ ====================
function calculateRadiatorCalc() {
    const radType = document.getElementById('radTypeCalc').value;
    const heightCoeffCalc = parseFloat(document.getElementById('radHeightCalc').value) / 2.5;
    const connType = document.getElementById('radConnectionTypeCalc').value;
    const wPerM2RadCalc = Math.round(100 * heightCoeffCalc);
    
    let totalRadiators = 0, totalChaseLen = 0, breakdownHtml = '';
    houseStructureCalc.forEach(floor => {
        if (floor.calculatedArea > 0) {
            const rads = Math.max(1, Math.ceil(floor.calculatedArea / 15));
            const floorPowerKw = ((floor.calculatedArea * wPerM2RadCalc) / 1000).toFixed(1);
            const chaseLen = connType === 'wall' ? rads * 2 : 0;
            totalRadiators += rads; totalChaseLen += chaseLen;
            breakdownHtml += `<div class="flex justify-between py-2 border-b border-dark-800/50 last:border-0"><span class="text-dark-400 text-sm">Этаж ${floor.floor} (${floor.calculatedArea} м²)</span><span class="text-dark-200 font-semibold text-sm text-right">${rads} рад. | ${floorPowerKw} кВт</span></div>`;
        }
    });

    let radPrice = 0, radName = '';
    if (radType === 'bimetal') { radPrice = totalRadiators * 14500; radName = 'Биметаллические'; }
    else if (radType === 'aluminum') { radPrice = totalRadiators * 10000; radName = 'Алюминиевые'; }
    else if (radType === 'steel') { radPrice = totalRadiators * 18000; radName = 'Стальные панельные'; }
    else { radPrice = totalRadiators * 55000; radName = 'Дизайн-радиаторы'; }

    const totalPipeLen = totalRadiators * 30;
    const pipeMaterialCost = totalPipeLen * 220;
    const manifoldCount = Math.max(1, Math.ceil(totalRadiators / 6));
    const manifoldCost = manifoldCount * 20000;
    const extraMaterials = totalRadiators * 2000;
    const matTotal = radPrice + pipeMaterialCost + manifoldCost + extraMaterials;

    const radInstallWork = totalRadiators * 7500;
    const pipeLayingWork = totalPipeLen * 220;
    const chaseWork = totalChaseLen * 1500;
    const pressureTestWork = 18000 + (totalRadiators * 500);
    const workTotal = Math.round((radInstallWork + pipeLayingWork + chaseWork + pressureTestWork) * PREMIUM_MARKUP);
    const total = matTotal + workTotal;
    
    const activeArea = houseStructureCalc.reduce((sum, f) => sum + (f.calculatedArea || 0), 0);
    const totalPowerRadKwCalc = ((activeArea * wPerM2RadCalc) / 1000).toFixed(1);

    const folder1 = createFolderCalc('Материалы и оборудование', icons.mat, [
        { label: `${radName} (${totalRadiators} шт.)`, value: formatRubricCalc(radPrice) },
        { label: 'Труба в теплоизоляции (K-Flex)', value: `~${totalPipeLen} м.п. (${formatRubricCalc(pipeMaterialCost)})` },
        { label: 'Коллекторная гребёнка', value: `${manifoldCount} шт. (${formatRubricCalc(manifoldCost)})` },
        { label: 'Доп. материалы (крепёж, фитинги)', value: formatRubricCalc(extraMaterials) }
    ], false);

    const folder2 = createFolderCalc('Итоговая цена', icons.tool, [
        { label: 'Монтаж радиаторов', value: formatRubricCalc(radInstallWork) },
        { label: 'Прокладка трасс в теплоизоляции', value: formatRubricCalc(pipeLayingWork) },
        ...(totalChaseLen > 0 ? [{ label: 'Штробление стен', value: `${totalChaseLen} м.п. (${formatRubricCalc(chaseWork)})` }] : []),
        { label: 'Опрессовка и прокачка системы', value: formatRubricCalc(pressureTestWork) }
    ], false);

    const folder3 = createFolderCalc('Итоговая сводка', icons.chart, [
        { label: 'Теплоотдача системы', value: `<span class="text-gold-400 font-bold">~${wPerM2RadCalc} Вт/м² (всего ${totalPowerRadKwCalc} кВт)</span>` },
        { label: 'Итого материалы', value: `<span class="text-gold-400 font-bold">${formatRubricCalc(matTotal)}</span>` },
        { label: 'Итого монтажные работы', value: `<span class="text-gold-400 font-bold">${formatRubricCalc(workTotal)}</span>` },
        { label: 'Общая стоимость', value: `<span class="text-2xl font-bold gold-text">${formatRubricCalc(total)}</span>` },
        { label: 'Стоимость за м²', value: `${activeArea > 0 ? Math.round(total/activeArea).toLocaleString('ru-RU') : '0'} ₽/м²` }
    ], true);

    const fullHtml = `
        <details class="result-folder" open>
            <summary>
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 flex-shrink-0">${icons.chart}</div>
                    <span class="text-base font-bold text-white">Радиаторы</span>
                </div>
                <span class="text-lg font-bold gold-text">${formatRubricCalc(total)}</span>
            </summary>
            <div class="folder-body">
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-2.5 border-b border-dark-800/50">
                        <span class="text-dark-400 text-sm">Материалы</span>
                        <span class="text-dark-100 font-semibold text-sm">${formatRubricCalc(matTotal)}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5 border-b border-dark-800/50">
                        <span class="text-dark-400 text-sm">Монтажные работы</span>
                        <span class="text-dark-100 font-semibold text-sm">${formatRubricCalc(workTotal)}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5">
                        <span class="text-white font-bold">ИТОГО</span>
                        <span class="text-xl font-bold gold-text">${formatRubricCalc(total)}</span>
                    </div>
                </div>
            </div>
        </details>
        ${folder1}
        ${folder2}
        ${folder3}`;

    document.getElementById('resultPanel-1').innerHTML = fullHtml;
    return { total: total, area: activeArea };
}

// ==================== КОТЕЛЬНАЯ ====================
function calculateBoilerCalc() {
    const activeArea = houseStructureCalc.reduce((sum, f) => sum + (f.calculatedArea || 0), 0);
    const fuelType = document.getElementById('boilerFuelTypeCalc').value;
    const contours = parseInt(document.getElementById('boilerContoursCalc').value);
    
    const basePower = Math.ceil(activeArea * 0.1);
    const recommendedPower = Math.ceil(basePower * 1.2);
    
    let boilerPrice = 0, modelName = '';
    if (fuelType === 'gas') { boilerPrice = 65000 + (recommendedPower * 2500); modelName = recommendedPower <= 24 ? 'Baxi Eco Four / Buderus Logamax / Viessmann Vitopend' : 'Baxi Luna / Buderus Logamax plus / Viessmann Vitodens'; }
    else if (fuelType === 'diesel') { boilerPrice = 120000 + (recommendedPower * 3500); modelName = 'De Dietrich / Baxi Slim / Buderus Logano'; }
    else if (fuelType === 'electric') { boilerPrice = 40000 + (recommendedPower * 2000); modelName = 'Protherm Скат / Vaillant eloBLOCK'; }
    else { boilerPrice = 95000 + (recommendedPower * 3000); modelName = 'Buderus Logano / Baxi Eco Logix'; }
    
    const pumpsPrice = contours * 20000;
    const tankSize = Math.max(12, Math.ceil(activeArea * 0.05));
    const tankPrice = 12000 + (tankSize * 200);
    const pipesAndFittingsPrice = 55000 + (contours * 18000);
    
    const matTotal = boilerPrice + pumpsPrice + tankPrice + pipesAndFittingsPrice;
    const workTotal = Math.round((85000 + (contours * 18000)) * PREMIUM_MARKUP);
    const grandTotal = matTotal + workTotal;

    const folder1 = createFolderCalc('Оборудование котельной', icons.mat, [
        { label: 'Котёл (модель)', value: modelName },
        { label: 'Стоимость котла', value: formatRubricCalc(boilerPrice) },
        { label: 'Насосные группы', value: `${contours} шт. (${formatRubricCalc(pumpsPrice)})` },
        { label: 'Расширительный бак', value: `${tankSize} л (${formatRubricCalc(tankPrice)})` },
        { label: 'Коллектор, трубы, фитинги', value: formatRubricCalc(pipesAndFittingsPrice) }
    ], false);

    const folder2 = createFolderCalc('Итоговая цена', icons.tool, [
        { label: 'Монтаж и пуско-наладка котельной', value: formatRubricCalc(workTotal) }
    ], false);

    const folder3 = createFolderCalc('Итоговая сводка', icons.chart, [
        { label: 'Рекомендуемая мощность', value: `<span class="text-gold-400 font-bold text-lg">${recommendedPower} кВт</span>` },
        { label: 'Итого материалы', value: `<span class="text-gold-400 font-bold">${formatRubricCalc(matTotal)}</span>` },
        { label: 'Итого монтажные работы', value: `<span class="text-gold-400 font-bold">${formatRubricCalc(workTotal)}</span>` },
        { label: 'Общая стоимость «Под ключ»', value: `<span class="text-2xl font-bold gold-text">${formatRubricCalc(grandTotal)}</span>` }
    ], true);

    document.getElementById('resultPanel-2').innerHTML = `
        <details class="result-folder" open>
            <summary>
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 flex-shrink-0">${icons.chart}</div>
                    <span class="text-base font-bold text-white">Котельная</span>
                </div>
                <span class="text-lg font-bold gold-text">${formatRubricCalc(grandTotal)}</span>
            </summary>
            <div class="folder-body">
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-2.5 border-b border-dark-800/50">
                        <span class="text-dark-400 text-sm">Материалы</span>
                        <span class="text-dark-100 font-semibold text-sm">${formatRubricCalc(matTotal)}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5 border-b border-dark-800/50">
                        <span class="text-dark-400 text-sm">Монтажные работы</span>
                        <span class="text-dark-100 font-semibold text-sm">${formatRubricCalc(workTotal)}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5">
                        <span class="text-white font-bold">ИТОГО</span>
                        <span class="text-xl font-bold gold-text">${formatRubricCalc(grandTotal)}</span>
                    </div>
                </div>
            </div>
        </details>
        ${folder1}
        ${folder2}
        ${folder3}
        <div class="mt-3 p-4 rounded-xl bg-dark-950/50 border border-dark-800 text-dark-500 text-xs leading-relaxed">
            Мощность котла рассчитана с запасом ~20% от базовой теплопотребности дома (укрупнённо, 0.1 кВт/м² на площадь с учётом этажности и утепления по СПб и ЛО). Количество насосных групп равно числу независимых контуров (отопление, тёплый пол, ГВС и т.д.). Расширительный бак посчитан по объёму системы — при необходимости разбивается на несколько баков меньшего объёма для компактности и резерва. Точный подбор оборудования и обвязки — на выезде специалиста.
        </div>`;
    return { total: grandTotal, area: activeArea, power: recommendedPower };
}

// ==================== ВОДОСНАБЖЕНИЕ ====================
function calculateWaterCalc() {
    const totalPoints = parseInt(document.getElementById('waterPointsTotalCalc').value) || 0;
    const concealedMechanisms = parseInt(document.getElementById('waterConcealedMechanismsCalc').value) || 0;
    const hasRecirculation = document.getElementById('waterRecirculationCalc').checked;

    const hasAnyFilter = document.getElementById('waterFilterMech').checked ||
        document.getElementById('waterFilterSediment').checked ||
        document.getElementById('waterFilterCarbon').checked ||
        document.getElementById('waterFilterOsmosis').checked ||
        document.getElementById('waterFilterSoftener').checked ||
        document.getElementById('waterFilterAutoStation').checked ||
        document.getElementById('waterFilterReducer').checked;

    let basePipeLength = totalPoints * 10;
    let actualPipeLength = hasRecirculation ? Math.round(basePipeLength * 1.3) : basePipeLength;
    let manifoldCount = 2;
    let pumpCost = 0;
    if (hasRecirculation) { manifoldCount = 3; pumpCost = 18000; }

    const boilerSize = hasRecirculation ? 200 : 150;
    const boilerCost = hasRecirculation ? 85000 : 65000;
    const boilerName = `Бойлер косвенного нагрева ${boilerSize} л`;
    const pipesAndFittingsCost = actualPipeLength * 100;
    const manifoldCost = manifoldCount * 15000;
    const insulationCost = actualPipeLength * 60;
    const totalMaterials = pipesAndFittingsCost + manifoldCost + boilerCost + insulationCost + pumpCost;

    const outletInstallWork = totalPoints * 3500;
    const concealedMechWork = concealedMechanisms * 18000;
    const pipeLayingWork = actualPipeLength * 220;
    const boilerInstallWork = hasRecirculation ? 25000 : 18000;
    const pressureTestWork = 18000 + (totalPoints * 200);
    const totalWork = Math.round((outletInstallWork + concealedMechWork + pipeLayingWork + boilerInstallWork + pressureTestWork) * PREMIUM_MARKUP);
    
    const filterItems = [];
    let filterCost = 0;
    if (document.getElementById('waterFilterMech').checked) { filterCost += 12000; filterItems.push({ label: 'Механический фильтр (Big Blue 20")', value: '12 000 ₽' }); }
    if (document.getElementById('waterFilterSediment').checked) { filterCost += 6000; filterItems.push({ label: 'Картриджный осадочный (5 мкм)', value: '6 000 ₽' }); }
    if (document.getElementById('waterFilterCarbon').checked) { filterCost += 12000; filterItems.push({ label: 'Сорбционный угольный', value: '12 000 ₽' }); }
    if (document.getElementById('waterFilterOsmosis').checked) { filterCost += 25000; filterItems.push({ label: 'Обратный осмос', value: '25 000 ₽' }); }
    if (document.getElementById('waterFilterSoftener').checked) { filterCost += 22000; filterItems.push({ label: 'Умягчитель магнитный', value: '22 000 ₽' }); }
    if (document.getElementById('waterFilterAutoStation').checked) { filterCost += 95000; filterItems.push({ label: 'Автоматическая станция водоподготовки', value: '95 000 ₽' }); }
    if (document.getElementById('waterFilterReducer').checked) { filterCost += 8000; filterItems.push({ label: 'Редуктор давления', value: '8 000 ₽' }); }
    const filterInstallWork = hasAnyFilter ? 18000 : 0;

    const totalMaterialsFinal = totalMaterials + filterCost;
    const totalWorkFinal = totalWork + filterInstallWork;
    const grandTotal = totalMaterialsFinal + totalWorkFinal;

    const folder1 = createFolderCalc('Материалы и оборудование', icons.mat, [
        { label: 'Трубы PEX (Rehau/Uponor) и фитинги', value: `~${actualPipeLength} м.п. (${formatRubricCalc(pipesAndFittingsCost)})` },
        { label: 'Коллекторные узлы', value: `${manifoldCount} шт. (${formatRubricCalc(manifoldCost)})` },
        { label: boilerName, value: formatRubricCalc(boilerCost) },
        ...(hasRecirculation ? [{ label: 'Рециркуляционный насос', value: formatRubricCalc(pumpCost) }] : []),
        { label: 'Утеплитель труб', value: formatRubricCalc(insulationCost) },
        ...(filterCost > 0 ? [{ label: 'Системы фильтрации', value: formatRubricCalc(filterCost) }] : [])
    ], false);

    const folder2 = createFolderCalc('Итоговая цена', icons.tool, [
        { label: 'Монтаж водорозеток', value: formatRubricCalc(outletInstallWork) },
        ...(concealedMechanisms > 0 ? [{ label: 'Монтаж скрытых механизмов', value: `${concealedMechanisms} шт. × 15 000 ₽` }] : []),
        { label: 'Прокладка труб в теплоизоляции', value: formatRubricCalc(pipeLayingWork) },
        { label: 'Монтаж и обвязка бойлера', value: formatRubricCalc(boilerInstallWork) },
        { label: 'Опрессовка и пуско-наладка', value: formatRubricCalc(pressureTestWork) },
        ...(hasAnyFilter ? [{ label: 'Монтаж системы фильтрации', value: formatRubricCalc(filterInstallWork) }] : [])
    ], false);

    const folder3 = createFolderCalc('Фильтры и водоподготовка', icons.mat, filterItems.length > 0 ? filterItems : [{ label: 'Не выбрано', value: '—' }], false);

    const folder4 = createFolderCalc('Итоговая сводка', icons.chart, [
        { label: 'Количество точек водоразбора', value: `<span class="text-white font-semibold">${totalPoints} шт.</span>` },
        { label: 'Итого материалы', value: `<span class="text-gold-400 font-bold">${formatRubricCalc(totalMaterialsFinal)}</span>` },
        { label: 'Итого монтажные работы', value: `<span class="text-gold-400 font-bold">${formatRubricCalc(totalWorkFinal)}</span>` },
        { label: 'Общая стоимость', value: `<span class="text-2xl font-bold gold-text">${formatRubricCalc(grandTotal)}</span>` }
    ], true);

    document.getElementById('resultPanel-3').innerHTML = `
        <details class="result-folder" open>
            <summary>
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 flex-shrink-0">${icons.chart}</div>
                    <span class="text-base font-bold text-white">Водоснабжение</span>
                </div>
                <span class="text-lg font-bold gold-text">${formatRubricCalc(grandTotal)}</span>
            </summary>
            <div class="folder-body">
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-2.5 border-b border-dark-800/50">
                        <span class="text-dark-400 text-sm">Материалы</span>
                        <span class="text-dark-100 font-semibold text-sm">${formatRubricCalc(totalMaterialsFinal)}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5 border-b border-dark-800/50">
                        <span class="text-dark-400 text-sm">Монтажные работы</span>
                        <span class="text-dark-100 font-semibold text-sm">${formatRubricCalc(totalWorkFinal)}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5">
                        <span class="text-white font-bold">ИТОГО</span>
                        <span class="text-xl font-bold gold-text">${formatRubricCalc(grandTotal)}</span>
                    </div>
                </div>
            </div>
        </details>
        ${folder1}
        ${folder2}
        ${folder3}
        ${folder4}`;
    return { total: grandTotal, area: 0 };
}

// ==================== КАНАЛИЗАЦИЯ ====================
const sewageRoomDefs = [
    { id: 'main_bath', name: 'Главный санузел', defaults: { toilet: true, sink: true, shower: true, washer: false, dishwasher: false, bidet: false } },
    { id: 'guest_bath', name: 'Гостевой санузел', defaults: { toilet: true, sink: true, shower: true, washer: false, dishwasher: false, bidet: false } },
    { id: 'bed_bath', name: 'Санузел в спальне', defaults: { toilet: true, sink: true, shower: false, washer: false, dishwasher: false, bidet: false } },
    { id: 'kitchen', name: 'Кухня', defaults: { toilet: false, sink: true, shower: false, washer: false, dishwasher: true, bidet: false } },
    { id: 'laundry', name: 'Постирочная / Котельная', defaults: { toilet: false, sink: true, shower: false, washer: true, dishwasher: false, bidet: false } }
];

const sewagePointLengths = {
    toilet: 7, sink: 5, shower: 6, washer: 5, dishwasher: 5, bidet: 5
};

const sewagePointLabels = {
    toilet: 'Унитаз ⌀110', sink: 'Раковина ⌀50', shower: 'Душ/Ванна ⌀50',
    washer: 'Стиральная машина ⌀50', dishwasher: 'Посудомоечная машина ⌀50', bidet: 'Биде ⌀50'
};

function buildSewageTable() {
    const tbody = document.getElementById('sewageTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const activeRoomIds = getActiveRoomIds();

    sewageRoomDefs.forEach(room => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-dark-800/50 hover:bg-dark-900/30 transition-colors';
        tr.dataset.roomId = room.id;
        if (!activeRoomIds.includes(room.id)) tr.style.display = 'none';
        let cells = `<td class="py-3 px-3 text-white font-semibold whitespace-nowrap">${room.name}</td>`;

        const points = ['toilet', 'sink', 'shower', 'washer', 'dishwasher', 'bidet'];
        points.forEach(p => {
            const checked = room.defaults[p] ? 'checked' : '';
            cells += `<td class="text-center py-3 px-2">
                <input type="checkbox" id="sp_${room.id}_${p}" aria-label="${room.name}: ${sewagePointLabels[p]}" ${checked} class="w-4 h-4 accent-gold-500 rounded cursor-pointer" onchange="calcSewageTable()">
            </td>`;
        });

        cells += `<td class="text-center py-3 px-2">
            <input type="checkbox" id="sp_${room.id}_chase" aria-label="${room.name}: штроба для канализации" class="w-4 h-4 accent-gold-500 rounded cursor-pointer" onchange="calcSewageTable()">
        </td>`;
        tr.innerHTML = cells;
        tbody.appendChild(tr);
    });
    calcSewageTable();
}

function getActiveRoomIds() {
    const checked = document.querySelectorAll('.room-toggle:checked');
    return Array.from(checked).map(cb => cb.dataset.room);
}

function toggleRoomVisibility() {
    const activeIds = getActiveRoomIds();
    document.querySelectorAll('#sewageTableBody tr').forEach(tr => {
        tr.style.display = activeIds.includes(tr.dataset.roomId) ? '' : 'none';
    });
    calcSewageTable();
}

document.querySelectorAll('.room-toggle').forEach(cb => {
    cb.addEventListener('change', toggleRoomVisibility);
});

function calcSewageTable() {
    let totalMeters = 0;
    let totalChase = 0;
    const roomMeters = {};
    const activeIds = getActiveRoomIds();

    sewageRoomDefs.forEach(room => {
        if (!activeIds.includes(room.id)) { roomMeters[room.id] = 0; return; }
        let roomM = 0;
        const points = ['toilet', 'sink', 'shower', 'washer', 'dishwasher', 'bidet'];
        points.forEach(p => {
            const cb = document.getElementById(`sp_${room.id}_${p}`);
            if (cb && cb.checked) roomM += sewagePointLengths[p];
        });
        const chaseCb = document.getElementById(`sp_${room.id}_chase`);
        if (chaseCb && chaseCb.checked) totalChase += roomM;
        roomMeters[room.id] = roomM;
        totalMeters += roomM;
    });

    const pipeLenEl = document.getElementById('sewagePipeLengthCalc');
    if (pipeLenEl) pipeLenEl.value = totalMeters;

    renderSewageScheme(roomMeters);
    updateSewageRisers();
}

function updateSewageRisers() {
    const floorsCount = parseInt(document.getElementById('floorsCountCalc')?.value) || 1;
    const risersEl = document.getElementById('risersInfo');
    if (!risersEl) return;

    if (floorsCount < 2) {
        risersEl.innerHTML = '<p class="text-dark-400 text-sm">Одноэтажный дом — стояки не требуются</p>';
        return;
    }

    let activeRooms = 0;
    const activeIds = getActiveRoomIds();
    sewageRoomDefs.forEach(room => {
        if (!activeIds.includes(room.id)) return;
        const hasAny = ['toilet', 'sink', 'shower', 'washer', 'dishwasher', 'bidet'].some(p => {
            const cb = document.getElementById(`sp_${room.id}_${p}`);
            return cb && cb.checked;
        });
        if (hasAny) activeRooms++;
    });

    const risersCount = Math.max(1, Math.min(activeRooms, Math.ceil(activeRooms / 2)));
    const riserHeight = 2.8;
    const totalLen = risersCount * (floorsCount - 1) * riserHeight;

    let html = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">`;
    for (let r = 1; r <= risersCount; r++) {
        html += `
            <div class="flex items-center gap-3 bg-dark-900/50 p-3 rounded-xl border border-dark-800">
                <div class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 flex-shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                </div>
                <div class="flex-1">
                    <div class="text-white text-sm font-semibold">Стояок №${r} ⌀110</div>
                    <div class="text-dark-400 text-xs">${floorsCount - 1} пролётов × ${riserHeight}м = ${((floorsCount - 1) * riserHeight).toFixed(1)} м.п.</div>
                </div>
            </div>`;
    }
    html += `</div>`;
    html += `<div class="mt-3 text-dark-400 text-xs">Итого стояков: <span class="text-white font-semibold">${risersCount} шт. × ${totalLen.toFixed(1)} м.п.</span></div>`;
    risersEl.innerHTML = html;
}

function renderSewageScheme(roomMeters) {
    const floorsCount = parseInt(document.getElementById('floorsCountCalc')?.value) || 1;
    const container = document.getElementById('sewageSchemeContainer');
    if (!container) return;

    const rooms = [];
    sewageRoomDefs.forEach(room => {
        const m = roomMeters ? roomMeters[room.id] : 0;
        if (m > 0) rooms.push({ name: room.name, meters: m });
    });

    if (rooms.length === 0) {
        container.innerHTML = '<p class="text-dark-500 text-sm">Отметьте точки слива в таблице — схема отобразится</p>';
        return;
    }

    const totalHorizontal = rooms.reduce((s, r) => s + r.meters, 0);
    const risersCount = floorsCount >= 2 ? Math.max(1, Math.min(rooms.length, Math.ceil(rooms.length / 2))) : 0;
    const riserHeight = 2.8;
    const totalRiserLen = risersCount * (floorsCount - 1) * riserHeight;

    const svgH = Math.max(200, floorsCount * 100 + 120);
    let svg = `<svg viewBox="0 0 700 ${svgH}" class="w-full max-w-2xl mx-auto" style="font-family: Inter, sans-serif;">`;
    const floorH = 90, startY = 20;

    for (let f = floorsCount; f >= 1; f--) {
        const y = startY + (floorsCount - f) * floorH;
        const isActive = houseStructureCalc[f - 1] && houseStructureCalc[f - 1].calculatedArea > 0;
        svg += `<rect x="10" y="${y}" width="680" height="${floorH - 8}" rx="8" fill="${isActive ? 'rgba(15,23,42,0.8)' : 'rgba(15,23,42,0.3)'}" stroke="${isActive ? 'rgba(251,191,36,0.3)' : 'rgba(51,65,85,0.3)'}" stroke-width="1"/>`;
        svg += `<text x="25" y="${y + 20}" fill="${isActive ? '#fbbf24' : '#475569'}" font-size="12" font-weight="700">Этаж ${f}</text>`;
        svg += `<text x="25" y="${y + 35}" fill="#64748b" font-size="10">${houseStructureCalc[f-1] ? houseStructureCalc[f-1].calculatedArea || 0 : 0} м²</text>`;

        const showRooms = rooms.slice(0, 4);
        showRooms.forEach((rm, p) => {
            const px = 150 + p * 130, py = y + 40;
            const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7'];
            const c = colors[p % colors.length];
            svg += `<circle cx="${px}" cy="${py + 12}" r="6" fill="${c}" opacity="0.8"/>`;
            svg += `<text x="${px}" y="${py + 30}" fill="#94a3b8" font-size="8" text-anchor="middle">${rm.name.substring(0, 12)}</text>`;
            svg += `<text x="${px}" y="${py + 44}" fill="#fbbf24" font-size="10" text-anchor="middle" font-weight="600">${rm.meters}м</text>`;
            if (p < showRooms.length - 1) {
                svg += `<line x1="${px + 8}" y1="${py + 12}" x2="${px + 122}" y2="${py + 12}" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4,2" opacity="0.4"/>`;
            }
        });

        if (f > 1 && floorsCount >= 2) {
            const rx = 630;
            svg += `<line x1="${rx}" y1="${y}" x2="${rx}" y2="${y + floorH - 8}" stroke="#ef4444" stroke-width="4"/>`;
            svg += `<text x="${rx}" y="${y + floorH / 2}" fill="#ef4444" font-size="9" text-anchor="middle" font-weight="600">⌀110</text>`;
        }
    }

    if (floorsCount >= 2) {
        svg += `<text x="630" y="${startY - 5}" fill="#ef4444" font-size="10" font-weight="600" text-anchor="middle">СТОЯК</text>`;
    }
    svg += `<text x="630" y="${startY + floorsCount * floorH + 15}" fill="#94a3b8" font-size="9" text-anchor="middle">→ вывод из дома</text>`;
    svg += `</svg>`;

    svg += `<div class="flex flex-wrap gap-3 mt-3 justify-center text-xs">
        <span class="text-dark-500">Горизонтально: <span class="text-white font-semibold">${totalHorizontal} м.п.</span></span>
        <span class="text-dark-500">Стояки: <span class="text-white font-semibold">${totalRiserLen.toFixed(1)} м.п.</span></span>
        <span class="text-dark-500">Точек: <span class="text-white font-semibold">${rooms.length} помещ.</span></span>
    </div>`;

    container.innerHTML = svg;
}

function calculateSewageCalc() {
    const sewageType = document.getElementById('sewageTypeCalc').value;
    let pipeLength = parseInt(document.getElementById('sewagePipeLengthCalc').value) || 0;
    const depth = parseFloat(document.getElementById('sewageDepthCalc').value);
    const turns = parseInt(document.getElementById('sewageTurnsCalc').value) || 0;
    const hasGreaseTrap = document.getElementById('sewageGreaseTrapCalc').checked;
    const hasBackwater = document.getElementById('sewageBackwaterCalc').checked;
    const hasAerator = document.getElementById('sewageAeratorCalc').checked;

    calcSewageTable();
    pipeLength = parseInt(document.getElementById('sewagePipeLengthCalc').value) || 0;

    const floorsCount = parseInt(document.getElementById('floorsCountCalc')?.value) || 1;
    const activeIds = getActiveRoomIds();
    const activeRooms = [];
    sewageRoomDefs.forEach(room => {
        if (!activeIds.includes(room.id)) return;
        const hasAny = ['toilet', 'sink', 'shower', 'washer', 'dishwasher', 'bidet'].some(p => {
            const cb = document.getElementById(`sp_${room.id}_${p}`);
            return cb && cb.checked;
        });
        if (hasAny) activeRooms.push(room);
    });
    const risersCount = floorsCount >= 2 ? Math.max(1, Math.min(activeRooms.length, Math.ceil(activeRooms.length / 2))) : 0;
    const riserHeight = 2.8;
    const totalRiserLength = risersCount * (floorsCount - 1) * riserHeight;

    renderSewageScheme();

    const pipe110Cost = 450, pipe50Cost = 280;
    let pipe110Len = 0, pipe50Len = 0;
    activeRooms.forEach(room => {
        ['toilet'].forEach(p => {
            const cb = document.getElementById(`sp_${room.id}_${p}`);
            if (cb && cb.checked) pipe110Len += sewagePointLengths[p];
        });
        ['sink', 'shower', 'washer', 'dishwasher', 'bidet'].forEach(p => {
            const cb = document.getElementById(`sp_${room.id}_${p}`);
            if (cb && cb.checked) pipe50Len += sewagePointLengths[p];
        });
    });

    const pipe110MatCost = pipe110Len * pipe110Cost;
    const pipe50MatCost = pipe50Len * pipe50Cost;
    const riserPipeCost = totalRiserLength * pipe110Cost;
    const fittingsCost = (activeRooms.length * 4 + turns + risersCount * 2) * 650;
    const insulationCost = (pipeLength + totalRiserLength) * 85;
    const totalPipeCost = pipe110MatCost + pipe50MatCost + riserPipeCost;

    let totalChaseLen = 0;
    activeRooms.forEach(room => {
        const chaseCb = document.getElementById(`sp_${room.id}_chase`);
        if (chaseCb && chaseCb.checked) {
            ['toilet', 'sink', 'shower', 'washer', 'dishwasher', 'bidet'].forEach(p => {
                const cb = document.getElementById(`sp_${room.id}_${p}`);
                if (cb && cb.checked) totalChaseLen += sewagePointLengths[p];
            });
        }
    });

    let stationCost = 0, stationName = '';
    if (sewageType === 'septic') { stationCost = 185000 + (activeRooms.length * 22000); stationName = 'Септик полипропилен'; }
    else if (sewageType === 'autonomous') { stationCost = 365000 + (activeRooms.length * 32000); stationName = 'АС Топас/Астра'; }
    else { stationCost = 38000; stationName = 'Впускной узел + ревизия'; }

    let additionalCost = 0;
    const additionalItems = [];
    if (hasGreaseTrap) { additionalCost += 28000; additionalItems.push({ label: 'Жироуловитель', value: '' }); }
    if (hasBackwater) { additionalCost += 8500; additionalItems.push({ label: 'Обратный клапан ⌀110', value: '' }); }
    if (hasAerator) { additionalCost += 45000; additionalItems.push({ label: 'Аэратор', value: '' }); }

    const excavationWork = pipeLength * depth * 380;
    const pipe110Work = pipe110Len * 320;
    const pipe50Work = pipe50Len * 220;
    const chaseWork = totalChaseLen * 950;
    const riserInstallWork = totalRiserLength * 380;
    const connectionWork = activeRooms.length * 5000;
    const turnsWork = turns * 2000;
    const riserMountWork = risersCount * 14000;
    const stationInstallWork = sewageType === 'central' ? 20000 : 60000;
    const pressureTestWork = 14000 + (risersCount * 3500);

    const totalMaterials = totalPipeCost + fittingsCost + insulationCost + stationCost + additionalCost;
    const totalWork = Math.round((excavationWork + pipe110Work + pipe50Work + chaseWork + riserInstallWork + connectionWork + turnsWork + riserMountWork + stationInstallWork + pressureTestWork) * PREMIUM_MARKUP);
    const grandTotal = totalMaterials + totalWork;

    const pointsBreakdown = [];
    activeRooms.forEach(room => {
        let roomM = 0, roomDetails = [];
        ['toilet', 'sink', 'shower', 'washer', 'dishwasher', 'bidet'].forEach(p => {
            const cb = document.getElementById(`sp_${room.id}_${p}`);
            if (cb && cb.checked) {
                roomM += sewagePointLengths[p];
                roomDetails.push(sewagePointLabels[p]);
            }
        });
        if (roomM > 0) {
            pointsBreakdown.push({ label: room.name, value: `${roomM} м.п. (${roomDetails.join(', ')})` });
        }
    });
    if (totalRiserLength > 0) {
        pointsBreakdown.push({ label: `Стояки (${risersCount} шт. × ${floorsCount-1} пролёта)`, value: `${totalRiserLength.toFixed(1)} м.п.` });
    }

    const folder1 = createFolderCalc('Материалы и оборудование', icons.mat, [
        { label: stationName, value: formatRubricCalc(stationCost) },
        { label: `Труба ПП ⌀110 мм`, value: `~${pipe110Len + totalRiserLength} м.п. (${formatRubricCalc(pipe110MatCost + riserPipeCost)})` },
        { label: `Труба ПП ⌀50 мм`, value: `~${pipe50Len} м.п. (${formatRubricCalc(pipe50MatCost)})` },
        { label: 'Фитинги, тройники, муфты, хомуты', value: formatRubricCalc(fittingsCost) },
        { label: 'Теплоизоляция труб', value: `${(pipeLength + totalRiserLength).toFixed(0)} м.п. (${formatRubricCalc(insulationCost)})` },
        ...additionalItems
    ], false);

    const folder2 = createFolderCalc('Монтажные работы', icons.tool, [
        { label: 'Земляные работы', value: `${pipeLength} м × ${depth} м × 380 ₽ (${formatRubricCalc(excavationWork)})` },
        { label: 'Прокладка ⌀110 мм', value: `${pipe110Len} м.п. × 320 ₽ (${formatRubricCalc(pipe110Work)})` },
        { label: 'Прокладка ⌀50 мм', value: `${pipe50Len} м.п. × 220 ₽ (${formatRubricCalc(pipe50Work)})` },
        ...(totalRiserLength > 0 ? [{ label: `Монтаж стояков (${risersCount} шт.)`, value: `${totalRiserLength.toFixed(1)} м.п. × 380 ₽ (${formatRubricCalc(riserInstallWork)})` }] : []),
        ...(risersCount > 0 ? [{ label: 'Крепление и фиксация стояков', value: `${risersCount} шт. (${formatRubricCalc(riserMountWork)})` }] : []),
        { label: 'Подключение точек слива', value: `${activeRooms.length} помещ. (${formatRubricCalc(connectionWork)})` },
        ...(turns > 0 ? [{ label: 'Монтаж поворотов', value: `${turns} шт. × 2 000 ₽ (${formatRubricCalc(turnsWork)})` }] : []),
        { label: stationInstallWork > 20000 ? 'Монтаж септика/станции' : 'Подключение к центральной сети', value: formatRubricCalc(stationInstallWork) },
        { label: 'Испытание и промывка системы', value: formatRubricCalc(pressureTestWork) }
    ], false);

    const folder3 = createFolderCalc('Разбивка по помещениям', icons.chart, pointsBreakdown.length > 0 ? pointsBreakdown : [{ label: 'Нет активных точек', value: '—' }], false);

    const folder4 = createFolderCalc('Итоговая сводка', icons.chart, [
        { label: 'Система', value: `<span class="text-gold-400 font-bold">${sewageType === 'central' ? 'Центральная' : sewageType === 'septic' ? 'Септик' : 'Автономная'}</span>` },
        { label: 'Помещений с точками слива', value: `<span class="text-white font-semibold">${activeRooms.length} шт.</span>` },
        { label: 'Труб ⌀110 мм (горизонт + стояки)', value: `<span class="text-white font-semibold">${(pipe110Len + totalRiserLength).toFixed(1)} м.п.</span>` },
        { label: 'Труб ⌀50 мм', value: `<span class="text-white font-semibold">${pipe50Len} м.п.</span>` },
        { label: 'Общая длина', value: `<span class="text-white font-semibold">${(pipeLength + totalRiserLength).toFixed(1)} м.п.</span>` },
        { label: 'Итого материалы', value: `<span class="text-gold-400 font-bold">${formatRubricCalc(totalMaterials)}</span>` },
        { label: 'Итого монтажные работы', value: `<span class="text-gold-400 font-bold">${formatRubricCalc(totalWork)}</span>` },
        { label: 'Общая стоимость', value: `<span class="text-2xl font-bold gold-text">${formatRubricCalc(grandTotal)}</span>` }
    ], true);

    document.getElementById('resultPanel-4').innerHTML = `
        <details class="result-folder" open>
            <summary>
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 flex-shrink-0">${icons.chart}</div>
                    <span class="text-base font-bold text-white">Канализация</span>
                </div>
                <span class="text-lg font-bold gold-text">${formatRubricCalc(grandTotal)}</span>
            </summary>
            <div class="folder-body">
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-2.5 border-b border-dark-800/50">
                        <span class="text-dark-400 text-sm">Материалы</span>
                        <span class="text-dark-100 font-semibold text-sm">${formatRubricCalc(totalMaterials)}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5 border-b border-dark-800/50">
                        <span class="text-dark-400 text-sm">Монтажные работы</span>
                        <span class="text-dark-100 font-semibold text-sm">${formatRubricCalc(totalWork)}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5">
                        <span class="text-white font-bold">ИТОГО</span>
                        <span class="text-xl font-bold gold-text">${formatRubricCalc(grandTotal)}</span>
                    </div>
                </div>
            </div>
        </details>
        ${folder1}
        ${folder2}
        ${folder3}
        ${folder4}`;
    return { total: grandTotal, area: 0 };
}

// ==================== ГЛАВНЫЙ РАСЧЁТ ====================
function calculateAll() {
    const floorResult = calculateFloorCalc();
    const radiatorResult = calculateRadiatorCalc();
    const boilerResult = calculateBoilerCalc();
    const waterResult = calculateWaterCalc();
    const sewageResult = calculateSewageCalc();

    const includeFloor = document.getElementById('includeFloorCalc')?.checked ?? true;
    const includeRadiator = document.getElementById('includeRadiatorCalc')?.checked ?? true;
    const includeBoiler = document.getElementById('includeBoilerCalc')?.checked ?? true;
    const includeWater = document.getElementById('includeWaterCalc')?.checked ?? true;
    const includeSewage = document.getElementById('includeSewageCalc')?.checked ?? true;
    const floorContribution = includeFloor ? floorResult.total : 0;
    const radiatorContribution = includeRadiator ? radiatorResult.total : 0;
    const boilerContribution = includeBoiler ? boilerResult.total : 0;
    const waterContribution = includeWater ? waterResult.total : 0;
    const sewageContribution = includeSewage ? sewageResult.total : 0;

    const grandTotal = floorContribution + radiatorContribution + boilerContribution + waterContribution + sewageContribution;
    const activeArea = floorResult.area || 1;

    document.getElementById('floorTotalDisplay').textContent = includeFloor ? formatRubricCalc(floorResult.total) : 'не выбрано';
    document.getElementById('radiatorTotalDisplay').textContent = includeRadiator ? formatRubricCalc(radiatorResult.total) : 'не выбрано';
    document.getElementById('boilerTotalDisplay').textContent = includeBoiler ? formatRubricCalc(boilerResult.total) : 'не выбрано';
    document.getElementById('waterTotalDisplay').textContent = includeWater ? formatRubricCalc(waterResult.total) : 'не выбрано';
    document.getElementById('sewageTotalDisplay').textContent = includeSewage ? formatRubricCalc(sewageResult.total) : 'не выбрано';
    document.getElementById('grandTotalDisplay').textContent = formatRubricCalc(grandTotal);
    document.getElementById('grandTotalDisplaySmall').textContent = formatRubricCalc(grandTotal);
    document.getElementById('pricePerM2Display').textContent = activeArea > 0 ? Math.round(grandTotal / activeArea).toLocaleString('ru-RU') : '0';

    // Отслеживание в Яндекс.Метрике
    if (typeof ym !== 'undefined') {
        ym(110351183, 'reachGoal', 'CALC_COMPLETE', { total: grandTotal, area: activeArea });
    }
    
    // Отслеживание в Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'calculator_complete', { total: grandTotal, area: activeArea });
    }

    // Отправка в Telegram через бэкенд
    try {
        const calcData = {
            area: activeArea,
            total: grandTotal,
            floor: floorContribution,
            radiator: radiatorContribution,
            boiler: boilerContribution,
            water: waterContribution,
            sewage: sewageContribution
        };
        fetch(BACKEND_URL + '/api/calc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(calcData)
        });
    } catch(e) {}

    switchResultTab(0);
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ШАГИ КАЛЬКУЛЯТОРА ====================
function nextStep(step) {
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.getElementById(`step-${step}`).classList.add('active');
    document.querySelectorAll('.step-dot').forEach(dot => {
        const s = parseInt(dot.dataset.step);
        dot.classList.remove('active', 'done');
        if (s < step) dot.classList.add('done');
        if (s === step) dot.classList.add('active');
    });
    currentStep = step;
    if (step === 4) { buildSewageTable(); }
    window.scrollTo({ top: document.getElementById('calculator').offsetTop - 100, behavior: 'smooth' });
}

function prevStep(step) { nextStep(step); }

// ==================== ПРОКРУТКА К КОНТАКТАМ ====================
function scrollToContact() {
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}

// ==================== ФОРМА ====================
document.getElementById('leadFormCalc').addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = this;
    const submitBtn = form.querySelector('button[type="submit"] span');
    const formData = new FormData(form);
    const name = formData.get('name') || '';
    const phone = formData.get('phone') || '';
    const message = formData.get('message') || '';

    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Отправляем...';
    form.querySelector('button[type="submit"]').disabled = true;

    try {
        const res = await fetch(BACKEND_URL + '/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, phone: phone, comment: message || 'Заявка с сайта', form: 'contact' })
        });
        if (!res.ok) throw new Error('bad status ' + res.status);

        form.classList.add('hidden');
        document.getElementById('formSuccessCalc').classList.remove('hidden');
        setTimeout(() => {
            form.classList.remove('hidden');
            document.getElementById('formSuccessCalc').classList.add('hidden');
            form.reset();
        }, 4000);
    } catch (err) {
        document.getElementById('formErrorCalc').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('formErrorCalc').classList.add('hidden');
        }, 6000);
    } finally {
        submitBtn.textContent = originalBtnText;
        form.querySelector('button[type="submit"]').disabled = false;
    }
});

// ==================== ЧАТ-АССИСТЕНТ "ИНЖЕНЕР АФОНЯ" ====================
let chatOpen = false;
let userMessages = [];
let chatHistory = [];
// Backend proxy URL (Render) — чат идёт через сервер, ключ не в браузере
const BACKEND_URL = 'https://sbteplo-backend.onrender.com';

const botResponses = {
    greeting: [
        'Привет! Я Василий из «Отопления от Саши Белого». Помогу с отоплением, водоснабжением или канализацией.',
        'Здравствуйте! Я Василий. Могу рассчитать стоимость, подобрать оборудование или объяснить, как работает система.'
    ],
    prices: {
        floor: 'Тёплый пол ПРЕМИУМ:\n• Работа: от 1500₽/м²\n• С материалом: от 2500₽/м²\n• Труба Rehau/Uponor PEX-a (гарантия 50 лет)\n• Коллектор, стяжка, утеплитель\n• Монтаж: 1-2 дня\n• Гарантия: 5 лет\n\nДля дома 100м²: работа ~150к₽, материалы ~100к₽, итого ~250к₽',
        radiator: 'Радиаторы:\n• Биметалл: 12000-18000₽/шт\n• Алюминий: 8000-12000₽/шт\n• Дизайн: от 45000₽\n• Монтаж: 3000-5000₽/шт\n\nДля дома 5 помещений: ~100-150к₽',
        boiler: 'Котельная ПРЕМИУМ:\n• От 150000₽\n• Включает: котёл Baxi/Buderus/Viessmann, насосы Grundfos, автоматику, монтаж\n• Проектирование и пусконаладка\n• Монтаж: 3-5 дней\n\nДля дома 150м²: котёл 25кВт ~150000₽',
        water: 'Водоснабжение:\n• От 3000₽/точка\n• Коллекторная разводка\n• Бойлер косвенного нагрева\n• Рециркуляция обеспечивает горячую воду сразу\n\nДля дома 5 точек: ~50-80к₽',
        filter: 'Фильтры:\n• Механический: 12000₽\n• Обратный осмос: 25000₽\n• Автоматическая станция: 95000₽\n\nПодбираем под качество воды.',
        sewage: 'Канализация:\n• Центральная: от 95000₽\n• Септик: от 220000₽\n• Автономная станция: от 420000₽\n\nВсё включено: трубы, земля, подключение.'
    },
    about: 'Компания «Отопление от Саши Белого», работаем в СПб и Ленинградской области.\n\nГарантия 5 лет.\nПремиум-материалы: Rehau, Uponor, Baxi, Buderus, Grundfos, Viessmann.\nПолный цикл работ: от проекта до сдачи.\nБесплатная консультация по телефону.\n\nСаша Белый — 40 лет в спорте.',
    contact: 'Телефон: +7 (911) 924-54-25.\n\nМогу рассчитать стоимость прямо здесь. Опиши дом или позвони, ответим за 2 минуты.',
    calc: 'Калькулятор на сайте поможет рассчитать стоимость. Также можно описать параметры дома здесь. Сколько комнат и какое отопление интересует?'
};

const keywords = {
    price: ['цена', 'стоимость', 'сколько', 'бюджет', 'деньги', 'оплата', 'расчёт', 'смета'],
    floor: ['тёплый пол', 'теплый пол', 'тп', 'полы', 'тёплые', 'теплые'],
    radiator: ['радиатор', 'батарея', 'батареи', 'радиаторы', 'отопление'],
    boiler: ['котёл', 'котел', 'котельная', 'котлы', 'автономное'],
    water: ['водоснабжение', 'вода', 'водопровод', 'горячая вода', 'гвс', 'хвс'],
    filter: ['фильтр', 'фильтры', 'водоподготовка', 'очистка', 'умягчение'],
    sewage: ['канализация', 'септик', 'стоки', 'слив', 'отведение', 'утилизация'],
    about: ['о вас', 'кто вы', 'расскажите', 'история', 'опыт'],
    contact: ['телефон', 'звонок', 'связаться', 'перезвоните', 'контакт', 'номер'],
    calc: ['калькулятор', 'рассчитать', 'расчёт', 'смету', 'смета']
};

function toggleChat() {
    chatOpen = !chatOpen;
    document.getElementById('chatWindow').classList.toggle('open', chatOpen);
    document.getElementById('chatFab').classList.toggle('active', chatOpen);
    document.getElementById('chatIconOpen').style.display = chatOpen ? 'none' : 'block';
    document.getElementById('chatIconClose').style.display = chatOpen ? 'block' : 'none';
    document.getElementById('chatBadge').style.display = 'none';
    
    if (chatOpen && document.getElementById('chatMessages').children.length === 0) {
        setTimeout(() => {
            addBotMsg(botResponses.greeting[Math.floor(Math.random() * botResponses.greeting.length)]);
        }, 500);
    }
}

function addBotMsg(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg bot';
    msgDiv.textContent = text;
    document.getElementById('chatMessages').appendChild(msgDiv);
    scrollChat();
}

function addUserMsg(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg user';
    msgDiv.textContent = text;
    document.getElementById('chatMessages').appendChild(msgDiv);
    userMessages.push(text);
    scrollChat();
}

function addSystemMsg(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg system';
    msgDiv.textContent = text;
    document.getElementById('chatMessages').appendChild(msgDiv);
    scrollChat();
}

function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.id = 'typingIndicator';
    typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div><span style="margin-left:8px;color:#fbbf24;font-size:14px;">Василий печатает...</span>';
    document.getElementById('chatMessages').appendChild(typing);
    scrollChat();
}

function hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

function scrollChat() {
    const container = document.getElementById('chatMessages');
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
}

function sendMsg() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    
    addUserMsg(text);
    input.value = '';
    
    showTyping();
    callAI(text);
}

function sendQuickMsg(text) {
    addUserMsg(text);
    showTyping();
    callAI(text);
}

async function callAI(userText) {
    chatHistory.push({ role: 'user', content: userText });

    // Промпт короткий — детали на бэке. Экономим токены.
    const messages = chatHistory.slice(-4);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);

        const response = await fetch(BACKEND_URL + '/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messages }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await response.json();
        hideTyping();

        if (data.choices && data.choices[0] && data.choices[0].message) {
            const reply = data.choices[0].message.content;
            chatHistory.push({ role: 'assistant', content: reply });
            addBotMsg(reply);
        } else {
            addBotMsg(getFallbackResponse(userText));
        }
    } catch (err) {
        hideTyping();
        if (err.name === 'AbortError') {
            addBotMsg('Ответ задерживается. Попробуй переформулировать или позвони: +7 (911) 924-54-25.');
        } else {
            addBotMsg(getFallbackResponse(userText));
        }
    }
}

function getFallbackResponse(text) {
    const lower = text.toLowerCase();
    if (matchKeywords(lower, keywords.sewage)) {
        if (matchKeywords(lower, keywords.price)) return botResponses.prices.sewage;
        return 'Канализация:\n• Центральная: от 95000₽\n• Септик: от 220000₽\n• Автономная станция: от 420000₽\n\nВсё включено: трубы, земля, подключение. Расскажи про участок — подберём вариант.';
    }
    if (matchKeywords(lower, keywords.price)) {
        if (matchKeywords(lower, keywords.floor)) return botResponses.prices.floor;
        if (matchKeywords(lower, keywords.radiator)) return botResponses.prices.radiator;
        if (matchKeywords(lower, keywords.boiler)) return botResponses.prices.boiler;
        if (matchKeywords(lower, keywords.water)) return botResponses.prices.water;
        if (matchKeywords(lower, keywords.filter)) return botResponses.prices.filter;
        return 'Наши цены (ПРЕМИУМ):\nТёплый пол: от 2500₽/м² с материалом\nРадиаторы: от 10000₽/шт\nКотельная: от 150000₽\nВодоснабжение: от 5000₽/точка\n\nМы работаем только с премиум-материалами. Сколько комнат?';
    }
    if (matchKeywords(lower, keywords.about)) return botResponses.about;
    if (matchKeywords(lower, keywords.contact)) return botResponses.contact;
    if (matchKeywords(lower, keywords.calc)) return botResponses.calc;
    if (matchKeywords(lower, ['привет', 'здравствуй', 'хай', 'hello', 'йо'])) return 'Привет! Я Василий, инженер-консультант. Помогу с отоплением, водоснабжением или канализацией.';
    if (matchKeywords(lower, ['спасибо', 'thanks', 'пока', 'до свидания'])) return 'Рад помочь. Если появятся вопросы — пиши или звони: +7 (911) 924-54-25.';
    if (matchKeywords(lower, ['ппр', 'полипропилен', 'пластик', 'дешёвые трубы', 'дешево'])) return 'Полипропилен — не для нас! Почему:\n\n1. Мы НЕ даём гарантию на ППР-монтаж\n2. ППР хрупкий, трескается от ударов и перепадов температур\n3. Соединения пайкой — слабое место, протечки через 3-5 лет\n4. Нет гибкости, нельзя обходить препятствия\n5. Заказчик потом платит дважды, сначала дёшево, потом переделывать\n\nМы работаем с Rehau/Uponor PEX-a, гарантия производителя 50 лет. На монтажные работы гарантия 5 лет.';
    if (matchKeywords(lower, ['как дела', 'что нового', 'чем занимаешься'])) return 'Помогаю клиентам с отоплением, водоснабжением и канализацией. Есть вопросы по дому?';
    if (matchKeywords(lower, ['кто ты', 'что ты умеешь', 'расскажи о себе'])) return 'Я Василий из «Отопления от Саши Белого». Помогу рассчитать стоимость, подобрать оборудование или объяснить, как работает система.';
    return 'Могу помочь с отоплением, водоснабжением или канализацией. Расскажи подробнее или позвони: +7 (911) 924-54-25.';
}

function matchKeywords(text, keywordsArray) {
    return keywordsArray.some(kw => text.includes(kw));
}

// Приветствие через 3 секунды
setTimeout(() => {
    if (!chatOpen) {
        document.getElementById('chatBadge').style.display = 'flex';
    }
}, 3000);

// ==================== МОДАЛЬНОЕ ОКНО СТАТЕЙ ====================
const articles = {
        1: { title: 'Монтаж отопления в СПб', content: '<p>Монтаж отопления в квартирах, частных домах и коттеджах Санкт-Петербурга и Ленинградской области.</p><p>Делаем проекты отопления любой сложности: газовое, электрическое, твердотопливное и комбинированное. Выполняем полный цикл работ — от расчёта и подбора оборудования до монтажа и запуска системы.</p><p>Работаем с проверенными материалами и современным оборудованием. Учитываем особенности вашего объекта, чтобы отопление было надёжным, экономичным и удобным в использовании.</p><p><strong>Ключевые слова:</strong> монтаж отопления СПб, установка отопления Санкт-Петербург, отопление в частном доме</p>' },
        2: { title: 'Как выбрать котёл', content: '<p>Газовый котёл — самый популярный вариант для частных домов. Экономичный, надёжный, автоматизированный.</p><p>Как рассчитать мощность: площадь дома × 120 Вт. Для дома 100м² — котёл 12-15 кВт, для 150м² — 18-22 кВт.</p><p>На что обратить внимание: КПД, автоматика, гарантия, сервис.</p><p><strong>Стоимость:</strong> газовые от 80 000₽, монтаж котельной от 150 000₽</p>' },
        3: { title: 'Тёплый пол в доме', content: '<p>Преимущества: равномерный нагрев, экономия газа 20-30%, комфорт, долговечность 50+ лет.</p><p>Водяной теплый пол — оптимальное решение для загородного дома. Работа от 1500₽/м², с материалом от 2500₽/м².</p><p>Материалы: труба Rehau/Uponor PEX-a (гарантия 50 лет), коллектор, утеплитель 50мм.</p>' },
        4: { title: 'Водоснабжение дома', content: '<p>Коллекторная разводка — каждая точка водоразбора подключается отдельной трубой.</p><p>Преимущества: равномерное давление, легкий ремонт, нет потерь.</p><p>Стоимость: от 5000₽/точка, бойлер 65 000-85 000₽, фильтры от 12 000₽.</p>' },
        5: { title: 'Канализация', content: '<p>Центральная канализация — самый удобный вариант. Подключение от 50 000₽.</p><p>Септик — автономная система. Стоимость от 300 000₽.</p><p>Автономная станция — полная очистка стоков, от 500 000₽.</p>' },
        6: { title: 'Монтаж радиаторов', content: '<p>Биметаллические: от 10 000₽/шт. Надёжные, устойчивы к коррозии.</p><p>Алюминиевые: от 8 000₽/шт. Лёгкие, красивые.</p><p>Дизайн-радиаторы: от 45 000₽/шт. Для ценителей эстетики.</p><p>Монтаж: 5 000-8 000₽/шт.</p>' },
        7: { title: 'Автоматика отопления', content: '<p>Термоголовки: 3 000-8 000₽/шт. Экономия 15-20%.</p><p>Сервоприводы: 5 000-12 000₽/шт. Точная регулировка.</p><p>Погодный контроллер: 15 000-40 000₽. Экономия 20-30% газа.</p>' },
        8: { title: 'Проектирование отопления', content: '<p>Проект нужен для: расчёта мощности, гидравлики, подбора оборудования, сметы.</p><p>Стоимость: тёплые полы от 30 000₽, котельная от 40 000₽, комплексный от 60 000₽.</p><p>Сроки: 3-7 рабочих дней.</p>' },
        9: { title: 'Ошибки при монтаже', content: '<p>1. Экономия на материалах — протечки через 3-5 лет.</p><p>2. Отсутствие проекта — неэффективная система.</p><p>3. Неправильный подбор котла — перерасход газа.</p><p>4. Нет автоматики — температура «гуляет».</p><p>5. Неправильный уклон труб — воздух в системе.</p><p>6. Нет группы безопасности — аварии.</p><p>7. Тонкая стяжка — трещины.</p>' }
};

function showArticle(id) {
    const article = articles[id];
    if (article) {
        document.getElementById('articleContent').innerHTML = '<div class="mb-6"><h2 class="text-2xl font-bold gold-text">' + article.title + '</h2></div>' + article.content + '<div class="mt-8 p-4 bg-dark-800 rounded-xl"><p class="text-gold-400 font-semibold">Нужна консультация?</p><p class="text-dark-300">Звоните: +7 (911) 924-54-25</p></div>';
        document.getElementById('articleModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeArticle() {
    document.getElementById('articleModal').classList.add('hidden');
    document.body.style.overflow = '';
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
    renderFloorsCalc();
    buildSewageTable();
    
    // Отслеживание просмотра калькулятора
    const calcSection = document.getElementById('calculator');
    if (calcSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (typeof ym !== 'undefined') ym(110351183, 'reachGoal', 'CALC_VIEW');
                    if (typeof gtag !== 'undefined') gtag('event', 'calculator_view');
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });
        observer.observe(calcSection);
    }
});
