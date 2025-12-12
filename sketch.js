// ===== CONFIGURAZIONE =====
const CONFIG = {
    colors: {
        background: '#ffffffff',
        text: '#000000ff',
        accent: '#FF2B00',
        accentLight: '#FF2B00',
        circle: '#111010b3',
        continentBase: '#FF2B00',
        highlightGlow: '#FF2B00',
        infoBox: '#ffffffff',
        infoBoxText: '#000000ff',
        infoBoxStroke: '#FF2B00',
        timeline: '#FF2B00',
        selectedContinent: '#b9b9b988'
    },
    layout: {
        centerXRatio: 0.70,
        maxRadius: 350,
        minRadius: 31.5,
        continentLabelOffset: 15,
        europeAsiaOffset: 15,
        infoBoxWidth: 200,
        infoBoxHeight: 70,
        bottomControlY: 100,
        marginX: 40,
        fontSizeControls: 16,
        centerYOffset: 10,
        topOffset: -20,
        leftPanelWidth: 300,
        controlButtonHeight: 50,
        controlButtonWidth: 50,
        timeframeFontSize: 30,
        yearFontSize: 30,
        labelFontSize: 17,
        titleStartY: 60,
        buttonStartY: 560,
        timeframeStartY: 600,
        yearStartY: 710
    },
    animation: {
        dotEntryDuration: 800,
        dotStaggerDelay: 30,
        dotPopScale: 1.4,
        randomDelayMax: 600,
        waveDuration: 1000,
        easingFunction: 'easeOutBack',
        fastDotEntryDuration: 400,
        fastRandomDelayMax: 200,
        // Configurazione per animazione stilizzata
        eruptionDuration: 1000, // Totale: 1 secondo
        implosionDuration: 250, // 250ms per implodere
        pauseDuration: 150, // 150ms di pausa drammatica
        explosionDuration: 600, // 600ms per esplodere
        maxExplosionScale: 100, // Quanto si espande
        shockwaveCount: 5,
        pulseCount: 8
    },
    centuries: [
        { label: 'Full range', value: null },
        { label: '4200 BC', value: -4200 },
        { label: '0', value: 0 },
        { label: '800 AD', value: 800 },
        { label: '1800 AD', value: 1800 },
        { label: '1850 AD', value: 1850 },
        { label: '1900 AD', value: 1900 },
        { label: '1950 AD', value: 1950 },
        { label: '2000 AD', value: 2000 },
        { label: '2050 AD', value: 2050 }
    ]
};

let impactLevels = [];
let allImpacts = [];

const CONCENTRIC_YEARS = [-4200, 0, 800, 1800, 1850, 1900, 1950, 2000, 2050];

// Quanto durano le animazioni
const SELECTION_ANIMATION_DURATION = 800;
const HOVER_ANIMATION_DURATION = 300;
const CIRCLE_REVEAL_DURATION = 1500;
const TIMELINE_ANIMATION_SPEED_NORMAL = 500;
const TIMELINE_ANIMATION_SPEED_FAST = 800;
const TIMELINE_PAUSE_BETWEEN_CYCLES = 1000;

// ===== STATO APPLICAZIONE =====
let state = {
    volcanoData: [],
    filteredData: [],
    selectedCentury: null,
    selectedContinent: null,
    hoveredVolcano: null,
    timelineYear: null,
    centerX: 0,
    centerY: 0,
    continentAngles: {},
    continentCounts: {},
    volcanoPositions: new Map(),
    globalYearRange: { min: 0, max: 0 },
    timelineButtons: [],
    currentCenturiesIndex: 0,
    isPlaying: false,
    leftControlAreas: null,
    rightControlAreas: null,
    asiaLabelY: 0,
    
    // Per le animazioni
    animationTimer: 0,
    animationSpeed: TIMELINE_ANIMATION_SPEED_NORMAL,
    pauseBetweenCycles: TIMELINE_PAUSE_BETWEEN_CYCLES,
    isPausedBetweenCycles: false,
    
    // Per i controlli a sinistra
    startButtonArea: null,
    timeFrameLeftArrows: null,
    timeFrameRightArrows: null,
    yearLeftArrow: null,
    yearRightArrow: null,
    
    // Per gestire gli anni
    availableYears: [],
    currentYearIndex: 0,
    displayedYear: null,
    yearActivatedByUser: false,
    
    // Per le animazioni dei vulcani
    selectionAnimationStart: new Map(),
    hoverAnimationStart: new Map(),
    
    // Per l'animazione di apertura dei cerchi
    circleRevealStart: null,
    circleRevealProgress: 0,
    
    // Per l'animazione dei puntini
    dotAnimationStart: null,
    dotAnimationProgress: 0,
    dotAppearTimes: new Map(),
    
    // Per l'animazione a onde
    waveAnimationStart: null,
    waveAnimationProgress: 0,
    
    // Controlli animazioni
    disableDotEntryAnimation: false,
    useFastAnimations: false,
    
    // Per l'animazione di eruzione stilizzata
    eruption: {
        active: false,
        phase: 'idle', // 'imploding', 'pause', 'exploding', 'complete'
        x: 0,
        y: 0,
        startTime: 0,
        volcano: null,
        originalSize: 0,
        currentSize: 0,
        shockwaves: [],
        pulses: [],
        // Per tracciare le fasi
        implosionStart: 0,
        pauseStart: 0,
        explosionStart: 0
    }
};

// Immagine di sfondo
let radialBgImage;

// ===== MAPPATURA CONTINENTI =====
const CONTINENT_MAP = {
    'Arabia-S': 'Asia', 'Arabia-W': 'Asia', 'China-S': 'Asia', 'Halmahera-Indonesia': 'Asia',
    'Hokkaido-Japan': 'Asia', 'Honshu-Japan': 'Asia', 'Indonesia': 'Asia', 'Izu Is-Japan': 'Asia',
    'Java': 'Asia', 'Kamchatka': 'Asia', 'Kuril Is': 'Asia', 'Kyushu-Japan': 'Asia',
    'Lesser Sunda Is': 'Asia', 'Luzon-Philippines': 'Asia', 'Mindanao-Philippines': 'Asia',
    'Philippines-C': 'Asia', 'Ryukyu Is': 'Asia', 'Sangihe Is-Indonesia': 'Asia',
    'Sulawesi-Indonesia': 'Asia', 'Sumatra': 'Asia', 'Turkey': 'Asia',
    
    'Alaska Peninsula': 'Americhe', 'Alaska-SW': 'Americhe', 'Aleutian Is': 'Americhe',
    'Canada': 'Americhe', 'Chile-C': 'Americhe', 'Chile-S': 'Americhe', 'Colombia': 'Americhe',
    'Costa Rica': 'Americhe', 'Ecuador': 'Americhe', 'El Salvador': 'Americhe', 'Galapagos': 'Americhe',
    'Guatemala': 'Americhe', 'Hawaiian Is': 'Americhe', 'Mexico': 'Americhe', 'Nicaragua': 'Americhe',
    'Peru': 'Americhe', 'US-Oregon': 'Americhe', 'US-Washington': 'Americhe', 'US-Wyoming': 'Americhe',
    'W Indies': 'Americhe',
    
    'Azores': 'Europa', 'Canary Is': 'Europa', 'Greece': 'Europa', 'Iceland-NE': 'Europa',
    'Iceland-S': 'Europa', 'Iceland-SE': 'Europa', 'Iceland-SW': 'Europa', 'Italy': 'Europa',
    
    'Admiralty Is-SW Paci': 'Oceania', 'Banda Sea': 'Oceania', 'Bougainville-SW Paci': 'Oceania',
    'Kermadec Is': 'Oceania', 'New Britain-SW Pac': 'Oceania', 'New Guinea': 'Oceania',
    'New Guinea-NE of': 'Oceania', 'New Zealand': 'Oceania', 'Samoa-SW Pacific': 'Oceania',
    'Santa Cruz Is-SW Pac': 'Oceania', 'Solomon Is-SW Pacifi': 'Oceania', 'Tonga-SW Pacific': 'Oceania',
    'Vanuatu-SW Pacific': 'Oceania',
    
    'Africa-C': 'Africa', 'Africa-E': 'Africa', 'Africa-NE': 'Africa', 'Africa-W': 'Africa',
    'Cape Verde Is': 'Africa', 'Indian O-W': 'Africa', 'Red Sea': 'Africa'
};

const CONTINENTS = ['Asia', 'Americhe', 'Europa', 'Oceania', 'Africa'];

// 1 - Caricamento dati
function preload() {
    loadTable('assets/data_impatto.csv', 'csv', 'header', processTableData);
    radialBgImage = loadImage('assets/radial_bg.png');
}

// 2 - Processamento dati
function processTableData(table) {
    state.volcanoData = [];
    allImpacts = [];
    
    for (let r = 0; r < table.getRowCount(); r++) {
        let row = table.getRow(r);
        let location = row.getString('Location');
        
        let deaths = parseInt(row.getString('Deaths')) || 0;
        let impact = parseInt(row.getString('Impact')) || 1;
        
        if (!isNaN(impact)) {
            allImpacts.push(impact);
        }
        
        state.volcanoData.push({
            year: parseInt(row.getString('Year')) || 0,
            name: row.getString('Name'),
            location: location,
            country: row.getString('Country'),
            type: row.getString('Type'),
            impact: impact,
            deaths: deaths,
            continent: CONTINENT_MAP[location] || 'Sconosciuto'
        });
    }
    
    impactLevels = [...new Set(allImpacts)].sort((a, b) => a - b);
    
    if (!impactLevels.includes(15)) {
        impactLevels.push(15);
    }
    
    impactLevels.sort((a, b) => a - b);
    
    state.volcanoData.sort((a, b) => b.year - a.year);
    initializeData();
}

// 3 - Inizializzazione
function initializeData() {
    state.filteredData = [...state.volcanoData];
    state.globalYearRange = getGlobalYearRange();
    calculateContinentData();
    calculateVolcanoPositions();
    calculateTimelineButtons();
    updateAvailableYears();
    
    state.circleRevealStart = millis();
    state.dotAnimationStart = millis() + 300;
    state.dotAnimationProgress = 0;
    state.useFastAnimations = false;
    
    state.waveAnimationStart = null;
    state.waveAnimationProgress = 0;
    
    state.eruption = {
        active: false,
        phase: 'idle',
        x: 0,
        y: 0,
        startTime: 0,
        volcano: null,
        originalSize: 0,
        currentSize: 0,
        shockwaves: [],
        pulses: [],
        implosionStart: 0,
        pauseStart: 0,
        explosionStart: 0
    };
    
    state.dotAppearTimes.clear();
    state.filteredData.forEach(v => {
        let key = `${v.name}-${v.year}-${v.deaths}`;
        const randomDelay = Math.random() * CONFIG.animation.randomDelayMax;
        state.dotAppearTimes.set(key, randomDelay);
    });
    
    state.disableDotEntryAnimation = false;
}

// 4 - Calcolo dati continenti
function calculateContinentData() {
    state.continentCounts = CONTINENTS.reduce((acc, cont) => {
        acc[cont] = 0;
        return acc;
    }, {});
    
    state.volcanoData.forEach(v => {
        if (state.continentCounts[v.continent] !== undefined) {
            state.continentCounts[v.continent]++;
        }
    });
    
    let total = state.volcanoData.length;
    let startAngle = 0;
    
    state.continentAngles = {};
    CONTINENTS.forEach(cont => {
        let proportion = total > 0 ? state.continentCounts[cont] / total : 0;
        let angleSize = proportion * TWO_PI;
        
        state.continentAngles[cont] = {
            start: startAngle,
            end: startAngle + angleSize,
            mid: startAngle + angleSize / 2
        };
        
        startAngle += angleSize;
    });
}

// 5 - Calcolo posizioni vulcani
function calculateVolcanoPositions() {
    state.volcanoPositions.clear();
    
    const volcanoesByContinent = {};
    
    CONTINENTS.forEach(cont => {
        volcanoesByContinent[cont] = [];
    });
    
    state.filteredData.forEach(v => {
        let key = `${v.name}-${v.year}-${v.deaths}`;
        if (volcanoesByContinent[v.continent]) {
            volcanoesByContinent[v.continent].push({
                key: key,
                volcano: v,
                year: v.year
            });
        }
    });
    
    CONTINENTS.forEach(cont => {
        const angles = state.continentAngles[cont];
        if (!angles || volcanoesByContinent[cont].length === 0) return;
        
        volcanoesByContinent[cont].sort((a, b) => a.year - b.year);
        
        const angleRange = angles.end - angles.start;
        const angleStep = angleRange / Math.max(1, volcanoesByContinent[cont].length);
        
        volcanoesByContinent[cont].forEach((item, index) => {
            const angle = angles.start + (angleStep * (index + 0.5));
            state.volcanoPositions.set(item.key, angle);
        });
    });
}

// 6 - Aggiornamento anni disponibili
function updateAvailableYears() {
    if (state.selectedCentury === null) {
        state.availableYears = [...new Set(state.volcanoData.map(v => v.year))].sort((a, b) => a - b);
    } else {
        const centuryIndex = CONCENTRIC_YEARS.indexOf(state.selectedCentury);
        if (centuryIndex !== -1 && centuryIndex < CONCENTRIC_YEARS.length - 1) {
            const startYear = CONCENTRIC_YEARS[centuryIndex];
            const endYear = CONCENTRIC_YEARS[centuryIndex + 1];
            
            const filteredYears = state.volcanoData
                .filter(v => {
                    if (centuryIndex === CONCENTRIC_YEARS.length - 2) {
                        return v.year >= startYear && v.year <= endYear;
                    } else {
                        return v.year >= startYear && v.year < endYear;
                    }
                })
                .map(v => v.year);
            
            state.availableYears = [...new Set(filteredYears)].sort((a, b) => a - b);
        } else {
            state.availableYears = [];
        }
    }
    
    state.timelineYear = null;
    state.displayedYear = state.availableYears.length > 0 ? state.availableYears[0] : null;
    state.currentYearIndex = 0;
    state.yearActivatedByUser = false;
    
    state.isPlaying = false;
    state.animationTimer = 0;
    state.isPausedBetweenCycles = false;
    state.useFastAnimations = false;
    
    state.selectionAnimationStart.clear();
    state.hoverAnimationStart.clear();
    
    state.dotAnimationStart = millis();
    state.dotAnimationProgress = 0;
    state.disableDotEntryAnimation = false;
    
    state.dotAppearTimes.clear();
    state.filteredData.forEach(v => {
        let key = `${v.name}-${v.year}-${v.deaths}`;
        const randomDelay = Math.random() * CONFIG.animation.randomDelayMax;
        state.dotAppearTimes.set(key, randomDelay);
    });
}

// 7 - Calcolo raggio in base all'impatto
function getRadiusForImpact(impact) {
    if (impactLevels.length <= 1) return CONFIG.layout.minRadius;
    
    let idx = impactLevels.indexOf(impact);
    if (idx === -1) return CONFIG.layout.minRadius;
    
    const totalLevels = impactLevels.length;
    const normalized = idx / (totalLevels - 1);
    
    return map(normalized, 0, 1, CONFIG.layout.maxRadius, CONFIG.layout.minRadius);
}

// 8 - Disegno cerchi di impatto
function drawImpactCircles() {
    const specialIndices = [0, 4, 8, 12].filter(index => index < impactLevels.length);
    
    if (state.circleRevealStart !== null) {
        const elapsed = millis() - state.circleRevealStart;
        state.circleRevealProgress = constrain(elapsed / CIRCLE_REVEAL_DURATION, 0, 1);
        
        if (state.circleRevealProgress >= 1) {
            state.circleRevealStart = null;
        }
    }
    
    for (let i = 0; i < impactLevels.length; i++) {
        let radius = map(i, 0, impactLevels.length - 1, 
                        CONFIG.layout.maxRadius, CONFIG.layout.minRadius);
        noFill();
        
        const isSpecial = specialIndices.includes(i);
        
        if (isSpecial) {
            let animatedRadius = radius;
            let animatedStrokeWeight = 2.75;
            let animatedAlpha = 255;
            
            if (state.circleRevealProgress < 1) {
                const circleProgress = constrain((state.circleRevealProgress * impactLevels.length - i) / 4, 0, 1);
                animatedRadius = radius * circleProgress;
                animatedStrokeWeight = 2.75 * circleProgress;
                animatedAlpha = 255 * circleProgress;
            }
            
            stroke(255, 43, 0, animatedAlpha);
            strokeWeight(animatedStrokeWeight);
            ellipse(0, 0, animatedRadius * 2);
            
            if (state.circleRevealProgress >= 1) {
                const circleNumber = i + 1;
                const labelX = 0;
                const labelY = -radius - 15;
                
                push();
                fill(CONFIG.colors.accent);
                noStroke();
                textSize(16);
                textAlign(CENTER, CENTER);
                text(circleNumber, labelX, labelY);
                pop();
            }
        } else {
            let animatedRadius = radius;
            if (state.circleRevealProgress < 1) {
                const circleProgress = constrain((state.circleRevealProgress * impactLevels.length - i) / 4, 0, 1);
                animatedRadius = radius * circleProgress;
            }
            
            stroke(CONFIG.colors.circle);
            strokeWeight(0.5);
            ellipse(0, 0, animatedRadius * 2);
        }
    }
}

// 9 - Calcolo bottoni timeline
function calculateTimelineButtons() {
    state.timelineButtons = [];
    const tlY = height - CONFIG.layout.bottomControlY;
    const tlXStart = width * 0.2;
    const tlXEnd = width * 0.8;
    const tlW = tlXEnd - tlXStart;
    
    state.timelineButtons.push({
        label: 'all centuries',
        value: null,
        x: tlXStart - 40,
        y: tlY,
        radius: 8
    });
    
    CONCENTRIC_YEARS.forEach((year, i) => {
        const normalized = i / (CONCENTRIC_YEARS.length - 1);
        const xPos = tlXStart + normalized * tlW;
        
        state.timelineButtons.push({
            label: formatYearShort(year),
            value: year,
            x: xPos,
            y: tlY,
            radius: 8
        });
    });
}

// 10 - Applicazione filtri
function applyFilters() {
    state.filteredData = state.volcanoData.filter(v => {
        let centuryMatch = true;
        
        if (state.selectedCentury !== null) {
            const centuryIndex = CONCENTRIC_YEARS.indexOf(state.selectedCentury);
            if (centuryIndex !== -1 && centuryIndex < CONCENTRIC_YEARS.length - 1) {
                const startYear = CONCENTRIC_YEARS[centuryIndex];
                const endYear = CONCENTRIC_YEARS[centuryIndex + 1];
                
                if (centuryIndex === CONCENTRIC_YEARS.length - 2) {
                    centuryMatch = (v.year >= startYear && v.year <= endYear);
                } else {
                    centuryMatch = (v.year >= startYear && v.year < endYear);
                }
            } else {
                centuryMatch = false;
            }
        }
        
        const continentMatch = state.selectedContinent === null || 
                             v.continent === state.selectedContinent;
        return centuryMatch && continentMatch;
    });

    calculateContinentData();
    calculateVolcanoPositions();
    updateAvailableYears();
    
    if (state.selectedCentury !== null || state.selectedContinent !== null) {
        state.useFastAnimations = false;
        state.dotAnimationStart = millis();
        state.dotAnimationProgress = 0;
        
        state.dotAppearTimes.clear();
        state.filteredData.forEach(v => {
            let key = `${v.name}-${v.year}-${v.deaths}`;
            const randomDelay = Math.random() * CONFIG.animation.randomDelayMax;
            state.dotAppearTimes.set(key, randomDelay);
        });
    }
}

// 11 - Calcolo range anni
function getGlobalYearRange() {
    const years = state.volcanoData.map(v => v.year);
    return {
        min: Math.min(...years),
        max: Math.max(...years)
    };
}

// 12 - Animazione timeline
function updateAnimation() {
    if (!state.isPlaying || state.availableYears.length === 0) return;
    
    if (!state.yearActivatedByUser) {
        state.yearActivatedByUser = true;
        state.timelineYear = state.availableYears[state.currentYearIndex];
        state.displayedYear = state.availableYears[state.currentYearIndex];
        state.selectionAnimationStart.clear();
    }
    
    if (state.isPausedBetweenCycles) {
        state.animationTimer += deltaTime;
        if (state.animationTimer >= state.pauseBetweenCycles) {
            state.animationTimer = 0;
            state.isPausedBetweenCycles = false;
            state.currentYearIndex = 0;
            state.timelineYear = state.availableYears[0];
            state.displayedYear = state.availableYears[0];
        }
        return;
    }
    
    state.animationTimer += deltaTime;
    
    if (state.animationTimer >= state.animationSpeed) {
        state.animationTimer = 0;
        
        if (state.currentYearIndex < state.availableYears.length - 1) {
            state.currentYearIndex++;
        } else {
            state.isPausedBetweenCycles = true;
            return;
        }
    }
    
    state.timelineYear = state.availableYears[state.currentYearIndex];
    state.displayedYear = state.availableYears[state.currentYearIndex];
}

// 13 - Aggiornamento animazioni punti
function updateDotAnimations() {
    if (state.isPlaying) {
        state.disableDotEntryAnimation = true;
    } else if (!state.isPlaying && state.dotAnimationStart === null) {
        state.disableDotEntryAnimation = false;
    }
    
    if (state.dotAnimationStart !== null) {
        const elapsed = millis() - state.dotAnimationStart;
        const duration = state.useFastAnimations ? 
            CONFIG.animation.fastDotEntryDuration : 
            CONFIG.animation.dotEntryDuration;
        
        state.dotAnimationProgress = constrain(elapsed / duration, 0, 1);
        
        if (state.dotAnimationProgress >= 1) {
            state.dotAnimationStart = null;
        }
    }
    
    if (state.waveAnimationStart !== null) {
        const waveElapsed = millis() - state.waveAnimationStart;
        state.waveAnimationProgress = constrain(waveElapsed / CONFIG.animation.waveDuration, 0, 1);
        
        if (state.waveAnimationProgress >= 1) {
            state.waveAnimationStart = null;
        }
    }
}

// 14 - Animazioni veloci punti
function startFastDotAnimations() {
    state.useFastAnimations = true;
    state.dotAnimationStart = millis();
    state.dotAnimationProgress = 0;
    
    state.dotAppearTimes.clear();
    state.filteredData.forEach(v => {
        let key = `${v.name}-${v.year}-${v.deaths}`;
        const randomDelay = Math.random() * CONFIG.animation.fastRandomDelayMax;
        state.dotAppearTimes.set(key, randomDelay);
    });
}

// 15 - Animazione onde
function triggerWaveAnimation() {
    state.waveAnimationStart = millis();
    state.waveAnimationProgress = 0;
}

// 16 - Attiva eruzione vulcanica STILIZZATA
function triggerVolcanoEruption(volcano, x, y) {
    console.log("💥 ANIMAZIONE STILIZZATA per:", volcano.name);
    
    // Determina la dimensione originale in base all'impatto
    const originalSize = map(volcano.impact, 1, 15, 5, 15);
    
    state.eruption = {
        active: true,
        phase: 'imploding',
        x: x,
        y: y,
        startTime: millis(),
        volcano: volcano,
        originalSize: originalSize,
        currentSize: originalSize,
        shockwaves: [],
        pulses: [],
        implosionStart: millis(),
        pauseStart: 0,
        explosionStart: 0
    };
    
    // Crea onde d'urto per l'esplosione
    for (let i = 0; i < CONFIG.animation.shockwaveCount; i++) {
        state.eruption.shockwaves.push({
            startTime: 0, // Sarà impostato durante l'esplosione
            size: 0,
            maxSize: random(50, 100),
            thickness: random(1, 3),
            delay: i * 50
        });
    }
    
    // Crea impulsi radiali
    for (let i = 0; i < CONFIG.animation.pulseCount; i++) {
        state.eruption.pulses.push({
            angle: random(TWO_PI),
            distance: 0,
            maxDistance: random(50, 200),
            speed: random(3, 8),
            size: random(2, 6),
            active: false
        });
    }
    
    state.isPlaying = false;
    state.waveAnimationStart = null;
}

// 17 - Aggiorna animazione eruzione stilizzata
function updateEruptionAnimation() {
    if (!state.eruption.active) return;
    
    const currentTime = millis();
    const totalElapsed = currentTime - state.eruption.startTime;
    
    // Gestione delle fasi
    if (state.eruption.phase === 'imploding') {
        const implosionElapsed = currentTime - state.eruption.implosionStart;
        const implosionProgress = constrain(implosionElapsed / CONFIG.animation.implosionDuration, 0, 1);
        
        // Implosione: si riduce fino al 10% della dimensione originale
        state.eruption.currentSize = state.eruption.originalSize * (1 - implosionProgress * 0.9);
        
        if (implosionProgress >= 1) {
            state.eruption.phase = 'pause';
            state.eruption.pauseStart = currentTime;
            console.log("⏸️ PAUSA DRAMMATICA");
        }
        
    } else if (state.eruption.phase === 'pause') {
        const pauseElapsed = currentTime - state.eruption.pauseStart;
        
        if (pauseElapsed >= CONFIG.animation.pauseDuration) {
            state.eruption.phase = 'exploding';
            state.eruption.explosionStart = currentTime;
            console.log("💥 ESPLOSIONE!");
            
            // Attiva le onde d'urto
            for (let wave of state.eruption.shockwaves) {
                wave.startTime = currentTime + wave.delay;
            }
            
            // Attiva gli impulsi
            for (let pulse of state.eruption.pulses) {
                pulse.active = true;
            }
        }
        
    } else if (state.eruption.phase === 'exploding') {
        const explosionElapsed = currentTime - state.eruption.explosionStart;
        const explosionProgress = constrain(explosionElapsed / CONFIG.animation.explosionDuration, 0, 1);
        
        // Espansione radicale
        state.eruption.currentSize = state.eruption.originalSize * (1 + explosionProgress * CONFIG.animation.maxExplosionScale);
        
        // Aggiorna onde d'urto
        for (let wave of state.eruption.shockwaves) {
            if (wave.startTime > 0 && currentTime >= wave.startTime) {
                const waveElapsed = currentTime - wave.startTime;
                if (waveElapsed < 400) {
                    const waveProgress = constrain(waveElapsed / 400, 0, 1);
                    wave.size = waveProgress * wave.maxSize;
                }
            }
        }
        
        // Aggiorna impulsi
        for (let pulse of state.eruption.pulses) {
            if (pulse.active) {
                pulse.distance = min(pulse.distance + pulse.speed, pulse.maxDistance);
            }
        }
        
        if (explosionProgress >= 1) {
            state.eruption.phase = 'complete';
            console.log("✅ ANIMAZIONE COMPLETATA");
            
            // Reindirizza alla pagina di dettaglio
            setTimeout(() => {
                const v = state.eruption.volcano;
                const url = `detail.html?name=${encodeURIComponent(v.name)}&year=${v.year}&impact=${v.impact}`;
                console.log("Reindirizzamento a:", url);
                window.location.href = url;
            }, 100);
        }
    }
}

// 18 - Disegna animazione eruzione STILIZZATA
function drawEruption() {
    if (!state.eruption.active) return;
    
    push();
    
    const currentTime = millis();
    
    // 1. PUNTINO CENTRALE (con animazione)
    if (state.eruption.phase === 'imploding' || state.eruption.phase === 'pause') {
        // Durante implosione e pausa, mostra il puntino che si riduce
        const size = state.eruption.currentSize;
        
        // Puntino principale (nero con bordo rosso)
        fill(0);
        stroke(255, 43, 0);
        strokeWeight(2);
        circle(state.eruption.x, state.eruption.y, size);
        
        // Effetto di vibrazione durante la pausa
        if (state.eruption.phase === 'pause') {
            const pulseTime = currentTime - state.eruption.pauseStart;
            const pulseSize = sin(pulseTime * 0.05) * 3;
            
            noFill();
            stroke(255, 43, 0, 100);
            strokeWeight(1);
            circle(state.eruption.x, state.eruption.y, size + pulseSize);
        }
        
    } else if (state.eruption.phase === 'exploding') {
        // Durante l'esplosione, il puntino diventa il centro dell'esplosione
        
        // 2. CENTRO DELL'ESPLOSIONE (bianco puro)
        const explosionProgress = constrain((currentTime - state.eruption.explosionStart) / CONFIG.animation.explosionDuration, 0, 1);
        const centerAlpha = 255 * (1 - explosionProgress * 0.7);
        
        fill(255, 255, 255, centerAlpha);
        noStroke();
        circle(state.eruption.x, state.eruption.y, state.eruption.currentSize * 0.3);
        
        // 3. ANELLO DI ESPANSIONE PRINCIPALE
        noFill();
        stroke(255, 43, 0, 200 * (1 - explosionProgress));
        strokeWeight(4);
        circle(state.eruption.x, state.eruption.y, state.eruption.currentSize);
        
        // 4. ONDE D'URTO SECONDARIE
        for (let wave of state.eruption.shockwaves) {
            if (wave.startTime > 0 && currentTime >= wave.startTime) {
                const waveElapsed = currentTime - wave.startTime;
                if (waveElapsed < 400) {
                    const waveProgress = waveElapsed / 400;
                    const alpha = 150 * (1 - waveProgress);
                    
                    // Onda d'urto principale
                    stroke(255, 43, 0, alpha);
                    strokeWeight(wave.thickness);
                    circle(state.eruption.x, state.eruption.y, wave.size);
                    
                    // Onda secondaria più sottile
                    stroke(255, 255, 255, alpha * 0.6);
                    strokeWeight(wave.thickness * 0.5);
                    circle(state.eruption.x, state.eruption.y, wave.size * 1.2);
                }
            }
        }
        
        // 5. IMPULSI RADIALI (linee che si irradiano dal centro)
        for (let pulse of state.eruption.pulses) {
            if (pulse.active) {
                const endX = state.eruption.x + cos(pulse.angle) * pulse.distance;
                const endY = state.eruption.y + sin(pulse.angle) * pulse.distance;
                
                // Linea radiale
                stroke(255, 43, 0, 150 * (1 - pulse.distance / pulse.maxDistance));
                strokeWeight(1);
                line(state.eruption.x, state.eruption.y, endX, endY);
                
                // Punto finale
                fill(255, 255, 255, 200 * (1 - pulse.distance / pulse.maxDistance));
                noStroke();
                circle(endX, endY, pulse.size);
            }
        }
        
        // 6. ESPANSIONE RADIALE GRADUALE (cerchi multipli)
        const expansionCount = 3;
        for (let i = 0; i < expansionCount; i++) {
            const offset = i * 0.2;
            const adjustedProgress = max(0, explosionProgress - offset);
            
            if (adjustedProgress > 0) {
                const circleSize = state.eruption.currentSize * (0.5 + i * 0.3);
                const alpha = 100 * (1 - adjustedProgress);
                
                noFill();
                stroke(255, 100, 0, alpha);
                strokeWeight(2 - i * 0.5);
                circle(state.eruption.x, state.eruption.y, circleSize);
            }
        }
        
        // 7. EFFETTO DI DISTORSIONE (per l'onda d'urto)
        if (explosionProgress < 0.5) {
            const distortionProgress = explosionProgress * 2;
            const distortionAlpha = 80 * (1 - distortionProgress);
            
            // Cerchi di distorsione
            for (let i = 0; i < 3; i++) {
                const size = state.eruption.currentSize * (0.3 + i * 0.2);
                noFill();
                stroke(255, 200, 200, distortionAlpha);
                strokeWeight(1);
                drawingContext.setLineDash([5, 5]);
                circle(state.eruption.x, state.eruption.y, size);
                drawingContext.setLineDash([]);
            }
        }
        
        // 8. OVERLAY BIANCO PER EFFETTO LUMINOSO
        if (explosionProgress < 0.3) {
            const flashProgress = explosionProgress / 0.3;
            const flashAlpha = 30 * (1 - flashProgress);
            
            fill(255, 255, 255, flashAlpha);
            noStroke();
            rect(0, 0, width, height);
        }
    }
    
    pop();
}

// 19 - Funzioni easing
function easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

// 20 - Loop principale
function draw() {
    background(CONFIG.colors.background);
    
    updateLayout();
    
    updateAnimation();
    updateDotAnimations();
    updateEruptionAnimation();
    
    drawTitle();
    drawStartAnimationButton();
    drawLearnMoreButton(); // Aggiunto qui
    // ===== AGGIUNTA DELLA LEGENDA =====
    drawLegend();  // Aggiungo la funzione di disegno della legenda
    // ===== FINE AGGIUNTA =====
    drawTemporalRangeSelector();
    drawYearSelector();
    
    drawMainCircle();
    drawContinentLabels();
    
    // Disegna l'eruzione SOPRA tutto
    drawEruption();
    
    checkHover();
    drawInfobox();
}

// 21 - Titolo
function drawTitle() {
    textSize(80);
    textFont('Helvetica');
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    
    const titleY = CONFIG.layout.titleStartY + CONFIG.layout.topOffset;
    
    fill(CONFIG.colors.text);
    text('SIGNIFICANT', CONFIG.layout.marginX, titleY);

    fill(CONFIG.colors.text);
    text('VOLCANIC', CONFIG.layout.marginX, titleY + 75);
     
    fill(CONFIG.colors.accent);
    text('ERUPTIONS', CONFIG.layout.marginX, titleY + 150);
    
    textStyle(NORMAL);
}

// 22 - Pulsante Start Animation
function drawStartAnimationButton() {
    const buttonX = CONFIG.layout.marginX;
    const buttonY = CONFIG.layout.buttonStartY;
    const buttonWidth = 250;
    const buttonHeight = CONFIG.layout.controlButtonHeight;

    stroke(CONFIG.colors.accent);
    strokeWeight(1);
    noFill();
    rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);

    fill(CONFIG.colors.accent);
    noStroke();
    
    if (state.isPlaying) {
        rect(buttonX + 15, buttonY + 15, 20, 20);
    } else {
        triangle(
            buttonX + 15, buttonY + 15,
            buttonX + 15, buttonY + 35,
            buttonX + 35, buttonY + 25
        );
    }

    fill(CONFIG.colors.text);
    noStroke();
    textSize(25);
    textAlign(LEFT, CENTER);
    const buttonText = state.isPlaying ? 'Stop Animation' : 'Start Animation';
    text(buttonText, buttonX + 50, buttonY + 25);

    state.startButtonArea = {
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight
    };
}

// ===== NUOVO PULSANTE LEARN MORE =====
function drawLearnMoreButton() {
    const buttonWidth = 160;
    const buttonHeight = CONFIG.layout.controlButtonHeight;
    // Posizionato in alto a destra con margine
    const buttonX = width - buttonWidth - CONFIG.layout.marginX;
    const buttonY = CONFIG.layout.titleStartY + CONFIG.layout.topOffset + 10;

    // Stessa estetica del pulsante Start Animation
    stroke(CONFIG.colors.accent);
    strokeWeight(1);
    noFill();
    rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);

    // Icona "i" di informazioni (stesso stile)
    fill(CONFIG.colors.accent);
    noStroke();
    
    // Disegna un cerchio con la "i" dentro
    push();
    translate(buttonX + 25, buttonY + 25);
    // Cerchio
    stroke(CONFIG.colors.accent);
    strokeWeight(1);
    noFill();
    circle(0, 0, 20);
    // Testo "i"
    fill(CONFIG.colors.accent);
    noStroke();
    textSize(16);
    textAlign(CENTER, CENTER);
    text("i", 0, 0);
    pop();

    // Testo "Learn More"
    fill(CONFIG.colors.text);
    noStroke();
    textSize(16);
    textAlign(LEFT, CENTER);
    text("Learn More", buttonX + 50, buttonY + 25);

    // Memorizza l'area per l'interazione
    state.learnMoreButtonArea = {
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight
    };
}

// ===== NUOVA FUNZIONE: DISEGNO DELLA LEGENDA =====
// 23 - Disegno della legenda sotto il bottone Start Animation e sopra il selettore time frame
function drawLegend() {
    const startX = CONFIG.layout.marginX;
    // POSIZIONE: Sotto il bottone Start Animation + 40px di margine
    const startY = CONFIG.layout.buttonStartY + CONFIG.layout.controlButtonHeight - 280;
    
    // Prima riga della legenda: Eruzione vulcanica
    const line1Y = startY;
    // Icona: pallino nero con bordo rosso (come i vulcani) - AUMENTATO a 14px
    fill(0); // Nero per il riempimento
    stroke(CONFIG.colors.accent); // Rosso per il bordo
    strokeWeight(8); // Aumentato lo spessore
    circle(startX + 15, line1Y + 12, 8); // Pallino di 14px di diametro
    
    // Testo spiegazione
    fill(CONFIG.colors.text); // Testo nero
    noStroke();
    textSize(16); // Font a 16 punti come richiesto
    textAlign(LEFT, CENTER);
    text('Volcanic eruptions', startX + 40, line1Y + 12);
    
    // Seconda riga della legenda: Impact range
    const line2Y = startY + 40; // Aumentato lo spazio tra le righe
    // Icona: cerchio con freccetta che punta all'interno - AUMENTATO a 18px
    push();
    translate(startX + 15, line2Y + 12);
    // Cerchio vuoto più grande
    noFill();
    stroke(CONFIG.colors.accent); // Rosso per il bordo
    strokeWeight(1); // Aumentato lo spessore
    circle(0, 0, 25); // Cerchio di 25px di diametro
    
    // Freccetta più grande che punta all'interno (da destra verso il centro)
    stroke(CONFIG.colors.accent);
    strokeWeight(1); // Aumentato lo spessore della freccia
    // Linea orizzontale da destra verso il centro
    line(12.5, 0, 1, 0);
    // Punta della freccia (triangolo più grande)
    line(1, 0, 3, -2.5);
    line(1, 0, 3, 2.5);
    pop();
    
    // Testo spiegazione
    fill(CONFIG.colors.text); // Testo nero
    noStroke();
    textSize(16); // Font a 16 punti come richiesto
    textAlign(LEFT, CENTER);
    text('Distribution based on impact range', startX + 40, line2Y + 12);
    
// Terza riga della legenda: Ordine temporale
const line3Y = startY + 80;

push();
translate(startX + 8, line3Y + 22);

// --- STILE ---
stroke(CONFIG.colors.accent);
strokeWeight(1);
noFill();

// Dimensione totale 25px → raggio ~12px
const R = 20;

// 1) ANGOLO RETTO (25 px totali)
line(0, 0, R, 0);     // orizzontale
line(0, 0, 0, -R);    // verticale

// 2) ARCO INTERNO (1/4 di cerchio dentro l’angolo)
arc(0, 0, R * 2, R * 2, PI + HALF_PI, TWO_PI);  
// parte da sinistra (225°) → arriva in basso (270°) → poi verso destra (0°)

// 3) FRECCIA SULL’ARCO (all’interno)
const ang = TWO_PI;  // punto finale dell’arco
const ax = cos(ang) * R;
const ay = sin(ang) * R;

// Corpo freccia
line(ax - 5, ay, ax, ay);

// Punta freccia
line(ax, ay, ax - 3, ay - 3);
line(ax, ay, ax - 3, ay + 3);

pop();

// Testo
fill(CONFIG.colors.text);
noStroke();
textSize(16);
textAlign(LEFT, CENTER);
text('Temporal order of eruptions', startX + 40, line3Y + 12);


}

// 24 - Selettore periodo
function drawTemporalRangeSelector() {
    const startX = CONFIG.layout.marginX;
    // MODIFICATO: Sposto più in basso per fare spazio alla legenda
    const startY = CONFIG.layout.timeframeStartY + 40; // Aggiungo 40px per la legenda
    const labelY = startY;
    const controlsY = startY + 40;

    fill(CONFIG.colors.text);
    noStroke();
    textSize(CONFIG.layout.labelFontSize);
    textAlign(LEFT, TOP);
    text('Select time frame:', startX, labelY);

    let yearString;
    
    if (state.selectedCentury === null) {
        yearString = 'Full range';
    } else {
        const index = CONCENTRIC_YEARS.indexOf(state.selectedCentury);
        if (index !== -1 && index < CONCENTRIC_YEARS.length - 1) {
            const startYear = formatYearShort(CONCENTRIC_YEARS[index]);
            const endYear = formatYearShort(CONCENTRIC_YEARS[index + 1]);
            yearString = startYear + ' - ' + endYear;
        } else {
            yearString = 'Full range';
        }
    }

    const leftArrowsX = startX;
    const leftArrowsY = controlsY;
    drawDoubleArrowWithBox(leftArrowsX, leftArrowsY, 60, 40, '<<', CONFIG.colors.text, true);

    const yearX = leftArrowsX + 60; 
    fill(CONFIG.colors.text);
    textSize(CONFIG.layout.timeframeFontSize);
    textAlign(CENTER, CENTER);
    text(yearString, yearX + 140, leftArrowsY + 20);

    const rightArrowsX = yearX + 280; 
    drawDoubleArrowWithBox(rightArrowsX, leftArrowsY, 60, 40, '>>', CONFIG.colors.text, true);

    state.timeFrameLeftArrows = {
        x: leftArrowsX,
        y: leftArrowsY,
        width: 60,
        height: 40
    };
    state.timeFrameRightArrows = {
        x: rightArrowsX,
        y: leftArrowsY,
        width: 60,
        height: 40
    };
}

// 25 - Selettore anno
function drawYearSelector() {
    const startX = CONFIG.layout.marginX;
    // MODIFICATO: Sposto più in basso per mantenere la distanza
    const startY = CONFIG.layout.yearStartY + 40; // Aggiungo 40px per compensare
    const labelY = startY;
    const controlsY = startY + 40;

    fill(CONFIG.colors.accent);
    noStroke();
    textSize(CONFIG.layout.labelFontSize);
    textAlign(LEFT, TOP);
    text('Select year:', startX, labelY);

    const leftArrowX = startX;
    const leftArrowY = controlsY;
    drawSingleArrowWithBox(leftArrowX, leftArrowY, 60, 40, '<', CONFIG.colors.accent, false);

    const yearX = leftArrowX + 100;
    
    let yearText;
    if (state.displayedYear !== null) {
        yearText = formatYear(state.displayedYear);
    } else if (state.availableYears.length > 0) {
        yearText = formatYear(state.availableYears[0]);
    } else {
        yearText = 'No data';
    }
    
    fill(CONFIG.colors.accent);
    textSize(CONFIG.layout.yearFontSize);
    textAlign(CENTER, CENTER);
    text(yearText, yearX + 110, leftArrowY + 20);

    const rightArrowX = yearX + 240;
    drawSingleArrowWithBox(rightArrowX, leftArrowY, 60, 40, '>', CONFIG.colors.accent, false);

    state.yearLeftArrow = {
        x: leftArrowX,
        y: leftArrowY,
        width: 50,
        height: 40
    };
    state.yearRightArrow = {
        x: rightArrowX,
        y: leftArrowY,
        width: 50,
        height: 40
    };
}

// 26 - Doppie frecce
function drawDoubleArrowWithBox(x, y, w, h, arrows, arrowColor, isBlack) {
    fill(255);
    stroke(isBlack ? CONFIG.colors.text : CONFIG.colors.accent);
    strokeWeight(1);
    rect(x, y, w, h, 5);
    
    fill(arrowColor);
    noStroke();
    textSize(25);
    textAlign(CENTER, CENTER);
    text(arrows, x + w/2, y + h/2);
}

// 27 - Singole frecce
function drawSingleArrowWithBox(x, y, w, h, arrow, arrowColor, isBlack) {
    fill(255);
    stroke(isBlack ? CONFIG.colors.text : CONFIG.colors.accent);
    strokeWeight(1);
    rect(x, y, w, h, 5);
    
    fill(arrowColor);
    noStroke();
    textSize(25);
    textAlign(CENTER, CENTER);
    text(arrow, x + w/2, y + h/2);
}

// 28 - Info box
function drawInfobox() {
    if (state.hoveredVolcano) {
        const volcano = state.hoveredVolcano;
        const boxWidth = CONFIG.layout.infoBoxWidth;
        const boxHeight = CONFIG.layout.infoBoxHeight;

        let x = mouseX + 25;
        let y = mouseY - boxHeight / 2;

        if (x + boxWidth > width) x = mouseX - boxWidth - 20;
        if (y < 0) y = 0;
        if (y + boxHeight > height) y = height - boxHeight;

        fill(CONFIG.colors.infoBox);
        stroke(CONFIG.colors.infoBoxStroke);
        strokeWeight(1);
        rect(x, y, boxWidth, boxHeight, 5);

        fill(CONFIG.colors.infoBoxText);
        noStroke();
        textSize(16);
        textAlign(LEFT, TOP);
        text(volcano.name, x + 10, y + 10);
        textSize(16);
        text('Year: ' + formatYear(volcano.year), x + 10, y + 40);
    }
}

// 29 - Cerchio principale
function drawMainCircle() {
    push();
    translate(state.centerX, state.centerY);
    
    if (radialBgImage) {
        let imageDim = 2 * 0.989;
        let imageSize = CONFIG.layout.maxRadius * imageDim;
        imageMode(CENTER);
        image(radialBgImage, 0, 0, imageSize, imageSize);
    }
    
    drawImpactCircles();
    drawContinentDividers();
    
    if (state.filteredData.length > 0) {
        drawVolcanoes();
    }
    
    pop();
}

// 30 - Divisori continenti
function drawContinentDividers() {
    stroke(CONFIG.colors.circle);
    strokeWeight(1);
    
    CONTINENTS.forEach(cont => {
        const angles = state.continentAngles[cont];
        if (angles) {
            line(0, 0, 
                 cos(angles.start) * CONFIG.layout.maxRadius, 
                 sin(angles.start) * CONFIG.layout.maxRadius);
        }
    });
}

// 31 - Disegna vulcani
function drawVolcanoes() {
    state.filteredData.forEach(v => {
        let key = `${v.name}-${v.year}-${v.deaths}`;
        let angle = state.volcanoPositions.get(key);
        const angles = state.continentAngles[v.continent];
        
        if (!angle && angles) {
            angle = angles.mid;
            state.volcanoPositions.set(key, angle);
        }
        
        if (!angle) return; 

        const r = getRadiusForImpact(v.impact);
        const x = cos(angle) * r;
        const y = sin(angle) * r;

        const isHighlighted = (state.timelineYear !== null && state.yearActivatedByUser && v.year === state.timelineYear);
        const isHovered = (state.hoveredVolcano === v);

        if (isHighlighted) {
            if (!state.selectionAnimationStart.has(key)) {
                state.selectionAnimationStart.set(key, millis());
            }
        } else {
            state.selectionAnimationStart.delete(key);
        }

        if (isHovered) {
            if (!state.hoverAnimationStart.has(key)) {
                state.hoverAnimationStart.set(key, millis());
            }
        } else {
            state.hoverAnimationStart.delete(key);
        }

        let selectionProgress = 0;
        if (isHighlighted && state.selectionAnimationStart.has(key)) {
            const startTime = state.selectionAnimationStart.get(key);
            const elapsed = millis() - startTime;
            selectionProgress = constrain(elapsed / SELECTION_ANIMATION_DURATION, 0, 1);
        }

        let hoverProgress = 0;
        if (isHovered && state.hoverAnimationStart.has(key)) {
            const startTime = state.hoverAnimationStart.get(key);
            const elapsed = millis() - startTime;
            hoverProgress = constrain(elapsed / HOVER_ANIMATION_DURATION, 0, 1);
        }

        if (isHighlighted || isHovered) {
            drawVolcanoGlow(v, x, y, isHighlighted, isHovered, selectionProgress, hoverProgress);
        }
        
        drawVolcanoDotAnimated(x, y, isHighlighted, isHovered, v, key);
    });
}

// 32 - Puntini vulcani animati
function drawVolcanoDotAnimated(x, y, isHighlighted, isHovered, volcano, key) {
    let entryProgress = 1;
    
    if (!state.disableDotEntryAnimation && state.dotAnimationStart !== null && state.dotAnimationProgress < 1) {
        const appearTime = state.dotAppearTimes.get(key) || 0;
        const elapsed = millis() - state.dotAnimationStart;
        
        if (elapsed >= appearTime) {
            const dotElapsed = elapsed - appearTime;
            const duration = state.useFastAnimations ? 
                CONFIG.animation.fastDotEntryDuration : 
                CONFIG.animation.dotEntryDuration;
            entryProgress = constrain(dotElapsed / duration, 0, 1);
        } else {
            entryProgress = 0;
        }
    }
    
    if (entryProgress === 0) return;
    
    const baseSize = isHighlighted ? 10 : isHovered ? 8 : 5;
    const finalSize = baseSize * entryProgress;
    const alpha = 255 * entryProgress;
    
    let color;
    if (isHighlighted) {
        color = CONFIG.colors.highlightGlow;
    } else if (isHovered) {
        color = CONFIG.colors.text;
    } else {
        color = CONFIG.colors.text;
    }
    
    fill(red(color), green(color), blue(color), alpha);
    noStroke();
    circle(x, y, finalSize);
}

// 33 - Bagliore vulcani
function drawVolcanoGlow(volcano, x, y, isHighlighted, isHovered, selectionProgress, hoverProgress) {
    let entryProgress = 1;
    const key = `${volcano.name}-${volcano.year}-${volcano.deaths}`;
    
    if (!state.disableDotEntryAnimation && state.dotAnimationStart !== null && state.dotAnimationProgress < 1) {
        const appearTime = state.dotAppearTimes.get(key) || 0;
        const elapsed = millis() - state.dotAnimationStart;
        
        if (elapsed >= appearTime) {
            const dotElapsed = elapsed - appearTime;
            const duration = state.useFastAnimations ? 
                CONFIG.animation.fastDotEntryDuration : 
                CONFIG.animation.dotEntryDuration;
            entryProgress = constrain(dotElapsed / duration, 0, 1);
        } else {
            entryProgress = 0;
        }
    }
    
    if (entryProgress === 0) return;
    
    let glowSize, alpha;
    
    if (isHighlighted) {
        let baseSize = map(volcano.impact, 5, 15, 60, 90);
        let baseAlpha = map(volcano.impact, 5, 15, 70, 100);
        glowSize = selectionProgress * baseSize * entryProgress;
        alpha = selectionProgress * baseAlpha * entryProgress;
    } else if (isHovered) {
        let baseSize = map(volcano.impact, 5, 15, 50, 80);
        let baseAlpha = map(volcano.impact, 5, 15, 60, 90);
        glowSize = hoverProgress * baseSize * entryProgress;
        alpha = hoverProgress * baseAlpha * entryProgress;
    } else {
        return;
    }

    fill(255, 43, 0, alpha);
    noStroke();
    circle(x, y, glowSize);
}

// 34 - Etichette continenti
function drawContinentLabels() {
    CONTINENTS.forEach(cont => {
        const angles = state.continentAngles[cont];
        if (!angles) return;

        const angle = angles.mid;
        
        let r;
        if (cont === 'Europa' || cont === 'Asia') {
            r = CONFIG.layout.maxRadius + CONFIG.layout.europeAsiaOffset;
        } else {
            r = CONFIG.layout.maxRadius + CONFIG.layout.continentLabelOffset;
        }
        
        const x = state.centerX + cos(angle) * r;
        const y = state.centerY + sin(angle) * r;
        
        if (cont === 'Asia') {
            state.asiaLabelY = y;
        }

        fill(CONFIG.colors.text);
        noStroke();
        textSize(16);
        
        let horizAlign = LEFT;
        if (cos(angle) < -0.1) {
            horizAlign = RIGHT;
        } else if (cos(angle) > 0.1) {
            horizAlign = LEFT;
        } else {
            horizAlign = CENTER;
        }
        
        let vertAlign = CENTER;
        if (sin(angle) < -0.1) {
            vertAlign = BOTTOM;
        } else if (sin(angle) > 0.1) {
            vertAlign = TOP;
        } else {
            vertAlign = CENTER;
        }
        
        textAlign(horizAlign, vertAlign);
        text(cont, x, y);
    });
}

// 35 - Controllo hover
function checkHover() {
    if (state.filteredData.length === 0) {
        state.hoveredVolcano = null;
    } else {
        let newHovered = null;
        let minDist = Infinity;
        
        state.filteredData.forEach(v => {
            const angles = state.continentAngles[v.continent];
            if (!angles) return;

            const key = `${v.name}-${v.year}-${v.deaths}`;
            const angle = state.volcanoPositions.get(key) || angles.mid;
            const r = getRadiusForImpact(v.impact);
            const x = state.centerX + cos(angle) * r;
            const y = state.centerY + sin(angle) * r;

            const d = dist(mouseX, mouseY, x, y);
            if (d < 15 && d < minDist) {
                minDist = d;
                newHovered = v;
            }
        });
        
        state.hoveredVolcano = newHovered;
    }
}

// 36 - Aggiornamento layout
function updateLayout() {
    state.centerX = width * CONFIG.layout.centerXRatio;
    state.centerY = height / 2 + CONFIG.layout.centerYOffset;
}

// 37 - Gestione click mouse
function mousePressed() {
    if (state.startButtonArea &&
        mouseX > state.startButtonArea.x &&
        mouseX < state.startButtonArea.x + state.startButtonArea.width &&
        mouseY > state.startButtonArea.y &&
        mouseY < state.startButtonArea.y + state.startButtonArea.height) {
        
        state.isPlaying = !state.isPlaying;
        
        if (state.isPlaying && state.availableYears.length > 0) {
            state.animationSpeed = TIMELINE_ANIMATION_SPEED_FAST;
            state.animationTimer = 0;
            state.isPausedBetweenCycles = false;
            
            state.useFastAnimations = true;
            startFastDotAnimations();
            
            state.disableDotEntryAnimation = true;
            
            if (!state.yearActivatedByUser) {
                state.yearActivatedByUser = true;
                state.currentYearIndex = 0;
                state.timelineYear = state.availableYears[0];
                state.displayedYear = state.availableYears[0];
            }
        } else if (state.availableYears.length === 0) {
            state.isPlaying = false;
        } else {
            state.animationSpeed = TIMELINE_ANIMATION_SPEED_NORMAL;
            state.useFastAnimations = false;
            state.disableDotEntryAnimation = false;
            
            state.dotAnimationStart = millis();
            state.dotAnimationProgress = 0;
            
            state.dotAppearTimes.clear();
            state.filteredData.forEach(v => {
                let key = `${v.name}-${v.year}-${v.deaths}`;
                const randomDelay = Math.random() * CONFIG.animation.randomDelayMax;
                state.dotAppearTimes.set(key, randomDelay);
            });
        }
        return;
    }

    if (state.timeFrameLeftArrows &&
        mouseX > state.timeFrameLeftArrows.x &&
        mouseX < state.timeFrameLeftArrows.x + state.timeFrameLeftArrows.width &&
        mouseY > state.timeFrameLeftArrows.y &&
        mouseY < state.timeFrameLeftArrows.y + state.timeFrameLeftArrows.height) {
        
        if (state.selectedCentury === null) {
            state.selectedCentury = CONCENTRIC_YEARS[CONCENTRIC_YEARS.length - 2];
        } else {
            const currentIndex = CONCENTRIC_YEARS.indexOf(state.selectedCentury);
            if (currentIndex > 0) {
                state.selectedCentury = CONCENTRIC_YEARS[currentIndex - 1];
            } else if (currentIndex === 0) {
                state.selectedCentury = null;
            }
        }
        applyFilters();
        return;
    }

    if (state.timeFrameRightArrows &&
        mouseX > state.timeFrameRightArrows.x &&
        mouseX < state.timeFrameRightArrows.x + state.timeFrameRightArrows.width &&
        mouseY > state.timeFrameRightArrows.y &&
        mouseY < state.timeFrameRightArrows.y + state.timeFrameRightArrows.height) {
        
        if (state.selectedCentury === null) {
            state.selectedCentury = CONCENTRIC_YEARS[0];
        } else {
            const currentIndex = CONCENTRIC_YEARS.indexOf(state.selectedCentury);
            if (currentIndex < CONCENTRIC_YEARS.length - 2) {
                state.selectedCentury = CONCENTRIC_YEARS[currentIndex + 1];
            } else if (currentIndex === CONCENTRIC_YEARS.length - 2) {
                state.selectedCentury = null;
            }
        }
        applyFilters();
        return;
    }

    if (state.yearLeftArrow &&
        mouseX > state.yearLeftArrow.x &&
        mouseX < state.yearLeftArrow.x + state.yearLeftArrow.width &&
        mouseY > state.yearLeftArrow.y &&
        mouseY < state.yearLeftArrow.y + state.yearLeftArrow.height &&
        state.availableYears.length > 0) {
        
        state.yearActivatedByUser = true;
        state.isPlaying = false;
        state.animationSpeed = TIMELINE_ANIMATION_SPEED_NORMAL;
        state.useFastAnimations = false;
        state.disableDotEntryAnimation = false;
        
        if (state.timelineYear === null) {
            state.currentYearIndex = state.availableYears.length - 1;
        } else {
            const currentIndex = state.availableYears.indexOf(state.timelineYear);
            if (currentIndex > 0) {
                state.currentYearIndex = currentIndex - 1;
            } else if (currentIndex === 0) {
                state.currentYearIndex = state.availableYears.length - 1;
            }
        }
        
        state.timelineYear = state.availableYears[state.currentYearIndex];
        state.displayedYear = state.availableYears[state.currentYearIndex];
        return;
    }

    if (state.yearRightArrow &&
        mouseX > state.yearRightArrow.x &&
        mouseX < state.yearRightArrow.x + state.yearRightArrow.width &&
        mouseY > state.yearRightArrow.y &&
        mouseY < state.yearRightArrow.y + state.yearRightArrow.height &&
        state.availableYears.length > 0) {
        
        state.yearActivatedByUser = true;
        state.isPlaying = false;
        state.animationSpeed = TIMELINE_ANIMATION_SPEED_NORMAL;
        state.useFastAnimations = false;
        state.disableDotEntryAnimation = false;
        
        if (state.timelineYear === null) {
            state.currentYearIndex = 0;
        } else {
            const currentIndex = state.availableYears.indexOf(state.timelineYear);
            if (currentIndex < state.availableYears.length - 1) {
                state.currentYearIndex = currentIndex + 1;
            } else if (currentIndex === state.availableYears.length - 1) {
                state.currentYearIndex = 0;
            }
        }
        
        state.timelineYear = state.availableYears[state.currentYearIndex];
        state.displayedYear = state.availableYears[state.currentYearIndex];
        return;
    }
    
    const distFromCenter = dist(mouseX, mouseY, state.centerX, state.centerY);
    if (distFromCenter < CONFIG.layout.maxRadius * 1.5) {
        triggerWaveAnimation();
    }

    let closestVolcano = null;
    let closestVolcanoPos = null;
    let minDistance = 25;

    for (let v of state.filteredData) {
        let key = `${v.name}-${v.year}-${v.deaths}`;
        
        if (!state.volcanoPositions.has(key)) continue;

        const angle = state.volcanoPositions.get(key);
        const radius = getRadiusForImpact(v.impact);

        const x = state.centerX + cos(angle) * radius;
        const y = state.centerY + sin(angle) * radius;

        const d = dist(mouseX, mouseY, x, y);

        if (d < minDistance) {
            minDistance = d;
            closestVolcano = v;
            closestVolcanoPos = {x, y};
        }
    }

    if (closestVolcano && closestVolcanoPos) {
        console.log("💥 AVVIO ANIMAZIONE STILIZZATA per:", closestVolcano.name);
        triggerVolcanoEruption(closestVolcano, closestVolcanoPos.x, closestVolcanoPos.y);
        return;
    }

    // Controllo per il pulsante Learn More
if (state.learnMoreButtonArea &&
    mouseX > state.learnMoreButtonArea.x &&
    mouseX < state.learnMoreButtonArea.x + state.learnMoreButtonArea.width &&
    mouseY > state.learnMoreButtonArea.y &&
    mouseY < state.learnMoreButtonArea.y + state.learnMoreButtonArea.height) {
    
    // Qui puoi aggiungere l'azione per "Learn More"
    // Per esempio, reindirizzare a una pagina di informazioni
    console.log("Learn More clicked");
    // window.location.href = "learn-more.html"; // Scommenta per reindirizzare
    return;
}
}

// 38 - Formattazione anno esteso
function formatYear(year) {
    return Math.abs(year) + (year < 0 ? ' BC' : ' AD');
}

// 39 - Formattazione anno abbreviato
function formatYearShort(year) {
    if (year < 0) {
        return Math.abs(year) + ' BC';
    } else if (year === 0) {
        return '0';
    } else {
        return year + ' AD';
    }
}

// 40 - Ridimensionamento finestra
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    updateLayout();
}

// 41 - Setup iniziale
function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    updateLayout();
    frameRate(60);
    console.log("Setup completato. Canvas creato.");
}