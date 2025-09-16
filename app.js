// Enhanced RideMax Pro - Behavioral Design Patterns Implementation
// ===========================================
// APPLICATION DATA AND CONSTANTS
// ===========================================

const APP_DATA = {
    locations: [
        {name: "Airport", latitude: 28.5562, longitude: 77.1000},
        {name: "Downtown Mall", latitude: 28.6139, longitude: 77.2090},
        {name: "Tech Park", latitude: 28.4595, longitude: 77.0266},
        {name: "University", latitude: 28.6448, longitude: 77.2167},
        {name: "Hospital", latitude: 28.6289, longitude: 77.2065},
        {name: "Railway Station", latitude: 28.6433, longitude: 77.2197},
        {name: "Bus Terminal", latitude: 28.6507, longitude: 77.2334},
        {name: "Metro Station", latitude: 28.6271, longitude: 77.2146}
    ],
    drivers: [
        {id: 1, name: "Raj Kumar", rating: 4.8, vehicle: "Sedan", status: "Available"},
        {id: 2, name: "Priya Sharma", rating: 4.9, vehicle: "SUV", status: "Available"},
        {id: 3, name: "Amit Singh", rating: 4.7, vehicle: "Hatchback", status: "Busy"},
        {id: 4, name: "Neha Gupta", rating: 4.6, vehicle: "Sedan", status: "Available"},
        {id: 5, name: "Vikram Patel", rating: 4.9, vehicle: "SUV", status: "Available"}
    ],
    riders: [
        {id: 1, name: "John Smith", subscribed: true},
        {id: 2, name: "Sarah Johnson", subscribed: true},
        {id: 3, name: "Mike Davis", subscribed: false},
        {id: 4, name: "Lisa Wong", subscribed: true}
    ],
    sampleRides: [
        {id: 1, from: "Airport", to: "Downtown Mall", distance: 12, status: "Available", driverId: 1},
        {id: 2, from: "Tech Park", to: "University", distance: 8, status: "Available", driverId: 2},
        {id: 3, from: "Hospital", to: "Railway Station", distance: 5, status: "Available", driverId: 4},
        {id: 4, from: "Airport", to: "Tech Park", distance: 15, status: "Available", driverId: 5},
        {id: 5, from: "University", to: "Downtown Mall", distance: 10, status: "Available", driverId: 1}
    ],
    baseFarePerKm: 15
};

// ===========================================
// SEARCH SYSTEM IMPLEMENTATION - NEW CORE FEATURE
// ===========================================

class RideSearchEngine {
    constructor() {
        this.availableRides = [...APP_DATA.sampleRides];
        this.searchResults = [];
        this.currentSort = 'distance';
    }

    searchRides(fromLocation, toLocation, maxDistance, fareType) {
        console.log('Searching rides:', { fromLocation, toLocation, maxDistance, fareType });
        
        // Show loading
        showLoading(true);
        
        // Simulate search delay
        setTimeout(() => {
            this.searchResults = this.availableRides
                .filter(ride => {
                    // Filter by locations if specified
                    if (fromLocation && fromLocation.trim() !== '' && !ride.from.toLowerCase().includes(fromLocation.toLowerCase())) {
                        return false;
                    }
                    if (toLocation && toLocation.trim() !== '' && !ride.to.toLowerCase().includes(toLocation.toLowerCase())) {
                        return false;
                    }
                    // Filter by max distance
                    return ride.distance <= maxDistance;
                })
                .map(ride => {
                    const driver = APP_DATA.drivers.find(d => d.id === ride.driverId);
                    const fareCalculator = new FareCalculator();
                    
                    // Set strategy based on fare type
                    switch (fareType) {
                        case 'Surge':
                            fareCalculator.setStrategy(new SurgeFareStrategy());
                            break;
                        case 'Discount':
                            fareCalculator.setStrategy(new DiscountFareStrategy());
                            break;
                        default:
                            fareCalculator.setStrategy(new NormalFareStrategy());
                    }
                    
                    const fare = fareCalculator.calculateFare(APP_DATA.baseFarePerKm, ride.distance);
                    
                    return {
                        ...ride,
                        driver: driver,
                        fare: fare,
                        fareType: fareType
                    };
                });
            
            this.sortResults(this.currentSort);
            this.displayResults();
            showLoading(false);
            
            showToast(`Found ${this.searchResults.length} available rides`, 'success');
        }, 1000);
    }

    sortResults(sortBy) {
        this.currentSort = sortBy;
        
        this.searchResults.sort((a, b) => {
            switch (sortBy) {
                case 'distance':
                    return a.distance - b.distance;
                case 'fare':
                    return a.fare - b.fare;
                case 'rating':
                    return b.driver.rating - a.driver.rating;
                default:
                    return 0;
            }
        });
        
        this.displayResults();
    }

    displayResults() {
        const resultsSection = document.getElementById('search-results');
        const tbody = document.getElementById('results-tbody');
        
        if (!resultsSection || !tbody) return;
        
        if (this.searchResults.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px;">No rides found matching your criteria</td></tr>';
        } else {
            tbody.innerHTML = this.searchResults.map(ride => `
                <tr>
                    <td>
                        <div class="route-cell">
                            <span>${ride.from}</span>
                            <span class="route-arrow">→</span>
                            <span>${ride.to}</span>
                        </div>
                    </td>
                    <td>
                        <div class="driver-info">
                            <span class="driver-name">${ride.driver.name}</span>
                            <div class="driver-rating">
                                <span>⭐ ${ride.driver.rating}</span>
                                <span>• ${ride.driver.vehicle}</span>
                            </div>
                        </div>
                    </td>
                    <td>${ride.distance} km</td>
                    <td>
                        <div class="fare-amount">₹${ride.fare.toFixed(2)}</div>
                        <div style="font-size: 11px; color: var(--color-text-secondary);">${ride.fareType}</div>
                    </td>
                    <td>
                        <button type="button" class="btn btn--primary book-ride-btn" data-ride-id="${ride.id}">
                            Book Ride
                        </button>
                    </td>
                </tr>
            `).join('');
            
            // Add event listeners to book ride buttons
            document.querySelectorAll('.book-ride-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const rideId = parseInt(this.dataset.rideId);
                    bookRideFromSearch(rideId);
                });
            });
        }
        
        resultsSection.style.display = 'block';
    }
}

// ===========================================
// OBSERVER PATTERN IMPLEMENTATION
// ===========================================

class Observer {
    update(status, driverInfo) {
        throw new Error('Update method must be implemented');
    }
}

class Rider extends Observer {
    constructor(id, name, subscribed = true) {
        super();
        this.id = id;
        this.name = name;
        this.subscribed = subscribed;
    }

    update(status, driverInfo) {
        if (this.subscribed) {
            const message = `${this.name} notified: Driver is now ${status}`;
            this.displayNotification(message);
            this.updateNotificationStats();
        }
    }

    displayNotification(message) {
        const notificationsFeed = document.getElementById('notifications-feed');
        if (!notificationsFeed) return;
        
        const notification = document.createElement('div');
        notification.className = 'notification-item';
        notification.innerHTML = `
            <div>
                <strong>${new Date().toLocaleTimeString()}</strong><br>
                ${message}
            </div>
        `;
        
        // Remove placeholder if exists
        const placeholder = notificationsFeed.querySelector('.notification-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        notificationsFeed.insertBefore(notification, notificationsFeed.firstChild);
        
        // Keep only last 15 notifications
        const notifications = notificationsFeed.querySelectorAll('.notification-item');
        if (notifications.length > 15) {
            notifications[notifications.length - 1].remove();
        }
    }

    updateNotificationStats() {
        const totalElement = document.getElementById('total-notifications');
        if (totalElement) {
            const current = parseInt(totalElement.textContent) || 0;
            totalElement.textContent = current + 1;
        }
    }

    subscribe() {
        this.subscribed = true;
    }

    unsubscribe() {
        this.subscribed = false;
    }
}

class Driver {
    constructor() {
        this.observers = [];
        this.status = 'Available';
    }

    addObserver(observer) {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
            console.log(`Added observer: ${observer.name}`);
        }
    }

    removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
            console.log(`Removed observer: ${observer.name}`);
        }
    }

    notifyObservers() {
        console.log(`Notifying ${this.observers.length} observers about status: ${this.status}`);
        this.observers.forEach(observer => {
            if (observer.subscribed) {
                observer.update(this.status, { driverId: 'DRIVER_001' });
            }
        });
    }

    setStatus(status) {
        const previousStatus = this.status;
        this.status = status;
        this.updateStatusDisplay();
        this.notifyObservers();
        showToast(`Driver status updated: ${previousStatus} → ${status}`, 'info');
    }

    updateStatusDisplay() {
        const statusElement = document.getElementById('current-status');
        if (statusElement) {
            statusElement.textContent = this.status;
            statusElement.className = 'status ' + this.getStatusClass(this.status);
            statusElement.classList.add('updating');
            
            setTimeout(() => {
                statusElement.classList.remove('updating');
            }, 600);
        }
    }

    getStatusClass(status) {
        switch (status) {
            case 'Available': return 'status--info';
            case 'Ride Accepted': 
            case 'Start Journey': return 'status--warning';
            case 'Complete Ride': return 'status--success';
            case 'Cancel Ride': return 'status--error';
            default: return 'status--info';
        }
    }
}

// ===========================================
// STRATEGY PATTERN IMPLEMENTATION
// ===========================================

class FareStrategy {
    calculate(baseFare, distance) {
        throw new Error('Calculate method must be implemented');
    }

    getMultiplier() {
        throw new Error('GetMultiplier method must be implemented');
    }

    getDescription() {
        throw new Error('GetDescription method must be implemented');
    }
}

class NormalFareStrategy extends FareStrategy {
    calculate(baseFare, distance) {
        return baseFare * distance * 1.0;
    }

    getMultiplier() {
        return 1.0;
    }

    getDescription() {
        return 'Standard pricing';
    }
}

class SurgeFareStrategy extends FareStrategy {
    calculate(baseFare, distance) {
        return baseFare * distance * 2.5;
    }

    getMultiplier() {
        return 2.5;
    }

    getDescription() {
        return 'Peak hours pricing';
    }
}

class DiscountFareStrategy extends FareStrategy {
    calculate(baseFare, distance) {
        return baseFare * distance * 0.7;
    }

    getMultiplier() {
        return 0.7;
    }

    getDescription() {
        return 'Promotional pricing';
    }
}

class FareCalculator {
    constructor() {
        this.strategy = new NormalFareStrategy();
    }

    setStrategy(strategy) {
        this.strategy = strategy;
    }

    calculateFare(baseFare, distance) {
        return this.strategy.calculate(baseFare, distance);
    }

    getStrategyInfo() {
        return {
            multiplier: this.strategy.getMultiplier(),
            description: this.strategy.getDescription()
        };
    }
}

// ===========================================
// COMMAND PATTERN IMPLEMENTATION
// ===========================================

class Command {
    execute() {
        throw new Error('Execute method must be implemented');
    }

    undo() {
        throw new Error('Undo method must be implemented');
    }

    getDescription() {
        throw new Error('GetDescription method must be implemented');
    }
}

class RideService {
    constructor() {
        this.currentRide = null;
        this.rideHistory = [];
    }

    bookRide(rideData = null) {
        const rideId = 'RIDE_' + Date.now();
        this.currentRide = {
            id: rideId,
            status: 'Booked',
            timestamp: new Date(),
            from: rideData?.from || 'Current Location',
            to: rideData?.to || 'Destination',
            fare: rideData?.fare || 150,
            driverId: rideData?.driverId || 1
        };
        this.updateRideState();
        return `Ride ${rideId} booked successfully (${this.currentRide.from} → ${this.currentRide.to})`;
    }

    cancelRide() {
        if (this.currentRide) {
            const rideId = this.currentRide.id;
            this.rideHistory.push({...this.currentRide, status: 'Cancelled'});
            this.currentRide = null;
            this.updateRideState();
            return `Ride ${rideId} has been cancelled`;
        }
        return 'No active ride to cancel';
    }

    rateRide() {
        if (this.currentRide) {
            const rideId = this.currentRide.id;
            this.currentRide.rating = 5;
            this.currentRide.status = 'Rated';
            this.rideHistory.push({...this.currentRide});
            this.currentRide = null;
            this.updateRideState();
            return `Ride ${rideId} rated successfully (5 stars)`;
        }
        return 'No active ride to rate';
    }

    searchAvailableRides() {
        const availableCount = APP_DATA.sampleRides.filter(ride => ride.status === 'Available').length;
        return `Found ${availableCount} available rides in your area`;
    }

    undoBookRide() {
        if (this.currentRide && this.currentRide.status === 'Booked') {
            const rideId = this.currentRide.id;
            this.currentRide = null;
            this.updateRideState();
            return `Booking for ride ${rideId} has been undone`;
        }
        return 'Cannot undo ride booking';
    }

    undoCancelRide() {
        const lastCancelled = this.rideHistory.find(ride => ride.status === 'Cancelled');
        if (lastCancelled) {
            this.rideHistory = this.rideHistory.filter(ride => ride.id !== lastCancelled.id);
            this.currentRide = {...lastCancelled, status: 'Booked'};
            this.updateRideState();
            return `Cancellation of ride ${lastCancelled.id} has been undone`;
        }
        return 'Cannot undo ride cancellation';
    }

    undoRateRide() {
        const lastRated = this.rideHistory.find(ride => ride.status === 'Rated');
        if (lastRated) {
            this.rideHistory = this.rideHistory.filter(ride => ride.id !== lastRated.id);
            this.currentRide = {...lastRated, status: 'Booked'};
            delete this.currentRide.rating;
            this.updateRideState();
            return `Rating for ride ${lastRated.id} has been undone`;
        }
        return 'Cannot undo ride rating';
    }

    undoSearchRides() {
        return 'Search operation cannot be undone (read-only operation)';
    }

    updateRideState() {
        const stateElement = document.getElementById('ride-state');
        if (stateElement) {
            if (this.currentRide) {
                stateElement.innerHTML = `
                    <div style="text-align: left;">
                        <p><strong>Ride ID:</strong> ${this.currentRide.id}</p>
                        <p><strong>Status:</strong> <span class="status status--${this.getStatusClass()}">${this.currentRide.status}</span></p>
                        <p><strong>Route:</strong> ${this.currentRide.from} → ${this.currentRide.to}</p>
                        <p><strong>Fare:</strong> ₹${this.currentRide.fare}</p>
                        <p><strong>Booked:</strong> ${this.currentRide.timestamp.toLocaleString()}</p>
                        ${this.currentRide.rating ? `<p><strong>Rating:</strong> ${this.currentRide.rating} ⭐</p>` : ''}
                    </div>
                `;
            } else {
                stateElement.innerHTML = '<p>No active ride</p>';
            }
        }
    }

    getStatusClass() {
        if (!this.currentRide) return 'info';
        switch (this.currentRide.status) {
            case 'Booked': return 'info';
            case 'Rated': return 'success';
            case 'Cancelled': return 'error';
            default: return 'info';
        }
    }
}

// Concrete Commands
class BookRideCommand extends Command {
    constructor(rideService, rideData = null) {
        super();
        this.rideService = rideService;
        this.rideData = rideData;
    }

    execute() {
        return this.rideService.bookRide(this.rideData);
    }

    undo() {
        return this.rideService.undoBookRide();
    }

    getDescription() {
        return 'Book Ride';
    }
}

class CancelRideCommand extends Command {
    constructor(rideService) {
        super();
        this.rideService = rideService;
    }

    execute() {
        return this.rideService.cancelRide();
    }

    undo() {
        return this.rideService.undoCancelRide();
    }

    getDescription() {
        return 'Cancel Ride';
    }
}

class RateRideCommand extends Command {
    constructor(rideService) {
        super();
        this.rideService = rideService;
    }

    execute() {
        return this.rideService.rateRide();
    }

    undo() {
        return this.rideService.undoRateRide();
    }

    getDescription() {
        return 'Rate Ride';
    }
}

class SearchRidesCommand extends Command {
    constructor(rideService) {
        super();
        this.rideService = rideService;
    }

    execute() {
        return this.rideService.searchAvailableRides();
    }

    undo() {
        return this.rideService.undoSearchRides();
    }

    getDescription() {
        return 'Search Rides';
    }
}

// Invoker - Enhanced Command Manager
class CommandManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistory = 10;
    }

    execute(command) {
        // Remove any commands after current index (for redo functionality)
        this.history = this.history.slice(0, this.currentIndex + 1);
        
        const result = command.execute();
        this.history.push({
            command: command,
            timestamp: new Date(),
            result: result,
            undone: false
        });
        
        this.currentIndex++;
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.currentIndex--;
        }
        
        this.updateUI();
        this.updateCommandHistory();
        this.logExecution(command.getDescription(), result);
        
        showToast(result, 'success');
        return result;
    }

    undo() {
        if (this.canUndo()) {
            const historyItem = this.history[this.currentIndex];
            const result = historyItem.command.undo();
            historyItem.undone = true;
            this.currentIndex--;
            
            this.updateUI();
            this.updateCommandHistory();
            this.logExecution(`Undo: ${historyItem.command.getDescription()}`, result);
            
            showToast(result, 'warning');
            return result;
        }
        return 'Nothing to undo';
    }

    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            const historyItem = this.history[this.currentIndex];
            const result = historyItem.command.execute();
            historyItem.undone = false;
            
            this.updateUI();
            this.updateCommandHistory();
            this.logExecution(`Redo: ${historyItem.command.getDescription()}`, result);
            
            showToast(result, 'info');
            return result;
        }
        return 'Nothing to redo';
    }

    canUndo() {
        return this.currentIndex >= 0 && !this.history[this.currentIndex]?.undone;
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    updateUI() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        const commandCount = document.getElementById('command-count');
        const stackSize = document.getElementById('stack-size');
        
        if (undoBtn) undoBtn.disabled = !this.canUndo();
        if (redoBtn) redoBtn.disabled = !this.canRedo();
        if (commandCount) commandCount.textContent = this.history.length;
        if (stackSize) stackSize.textContent = this.currentIndex + 1;
    }

    logExecution(operation, result) {
        const logContainer = document.getElementById('execution-log');
        if (!logContainer) return;
        
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        logItem.innerHTML = `
            <div>
                <strong>${operation}</strong>
                <div style="font-size: var(--font-size-xs); margin-top: 2px;">${result}</div>
            </div>
            <div class="log-timestamp">${new Date().toLocaleTimeString()}</div>
        `;
        
        // Remove placeholder if exists
        const placeholder = logContainer.querySelector('.log-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        logContainer.insertBefore(logItem, logContainer.firstChild);
        
        // Keep only last 20 log entries
        const logItems = logContainer.querySelectorAll('.log-item');
        if (logItems.length > 20) {
            logItems[logItems.length - 1].remove();
        }
    }

    updateCommandHistory() {
        const historyElement = document.getElementById('command-stack');
        if (!historyElement) return;
        
        if (this.history.length === 0) {
            historyElement.innerHTML = '<p class="history-placeholder">Command history will appear here...</p>';
            return;
        }

        historyElement.innerHTML = '';
        this.history.slice().reverse().forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${item.undone ? 'undone' : ''}`;
            const isActive = (this.history.length - 1 - index) === this.currentIndex;
            if (isActive && !item.undone) {
                historyItem.style.borderLeftColor = 'var(--color-success)';
                historyItem.style.background = 'var(--color-bg-3)';
            }
            historyItem.innerHTML = `
                <div>
                    <strong>${item.command.getDescription()}</strong>
                    ${isActive && !item.undone ? '<span style="color: var(--color-success); font-size: 10px;"> ← CURRENT</span>' : ''}
                    <div style="font-size: var(--font-size-xs); margin-top: 2px;">${item.result}</div>
                </div>
                <div class="history-timestamp">${item.timestamp.toLocaleTimeString()}</div>
            `;
            historyElement.appendChild(historyItem);
        });
    }
}

// ===========================================
// APPLICATION STATE AND INITIALIZATION
// ===========================================

// Global instances
let searchEngine;
let driver;
let fareCalculator;
let rideService;
let commandManager;
let riders = [];

// Current tab state
let currentTab = 'search';

// Initialize application
function initializeApp() {
    console.log('Initializing RideMax Pro application...');
    
    // Initialize Search Engine
    searchEngine = new RideSearchEngine();
    
    // Initialize Observer Pattern
    driver = new Driver();
    
    // Create riders from sample data
    riders = [];
    APP_DATA.riders.forEach(riderData => {
        const rider = new Rider(riderData.id, riderData.name, riderData.subscribed);
        riders.push(rider);
        if (rider.subscribed) {
            driver.addObserver(rider);
        }
    });
    
    updateRidersList();
    
    // Initialize Strategy Pattern
    fareCalculator = new FareCalculator();
    
    // Initialize Command Pattern
    rideService = new RideService();
    commandManager = new CommandManager();
    commandManager.updateUI();
    
    // Setup UI event listeners
    setupEventListeners();
    
    console.log('Application initialized successfully');
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Search functionality
    const searchBtn = document.getElementById('search-rides-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchRides);
    }
    
    // Location swap button
    const swapBtn = document.getElementById('swap-locations');
    if (swapBtn) {
        swapBtn.addEventListener('click', swapLocations);
    }
    
    // Location input autocomplete
    setupLocationAutocomplete('from-location', 'from-dropdown');
    setupLocationAutocomplete('to-location', 'to-dropdown');
    
    // Distance slider
    const distanceSlider = document.getElementById('max-distance');
    const distanceValue = document.getElementById('distance-value');
    
    if (distanceSlider && distanceValue) {
        distanceSlider.addEventListener('input', function() {
            distanceValue.textContent = this.value + ' km';
        });
    }
    
    // Sort dropdown
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            if (searchEngine) {
                searchEngine.sortResults(this.value);
            }
        });
    }
    
    // Observer pattern - driver actions
    document.querySelectorAll('[data-status]').forEach(btn => {
        btn.addEventListener('click', function() {
            const status = this.dataset.status;
            updateDriverStatus(status);
        });
    });
    
    // Add rider functionality
    const addRiderBtn = document.getElementById('add-rider-btn');
    if (addRiderBtn) {
        addRiderBtn.addEventListener('click', addRider);
    }
    
    // Rider name input
    const newRiderInput = document.getElementById('new-rider-name');
    if (newRiderInput) {
        newRiderInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addRider();
            }
        });
    }
    
    // Strategy pattern - calculate button
    const calculateBtn = document.getElementById('calculate-all-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateAllStrategies);
    }
    
    // Strategy inputs for real-time calculation
    const distanceInput = document.getElementById('distance');
    const baseFareInput = document.getElementById('base-fare');
    
    if (distanceInput && baseFareInput) {
        distanceInput.addEventListener('input', calculateAllStrategies);
        baseFareInput.addEventListener('input', calculateAllStrategies);
    }
    
    // Strategy selection
    document.querySelectorAll('[data-strategy]').forEach(card => {
        card.addEventListener('click', function() {
            const strategy = this.dataset.strategy;
            selectStrategy(strategy);
        });
    });
    
    // Command pattern buttons
    document.querySelectorAll('[data-command]').forEach(btn => {
        btn.addEventListener('click', function() {
            const command = this.dataset.command;
            executeCommand(command);
        });
    });
    
    // Undo/Redo buttons
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    if (undoBtn) {
        undoBtn.addEventListener('click', undoCommand);
    }
    if (redoBtn) {
        redoBtn.addEventListener('click', redoCommand);
    }
    
    console.log('Event listeners setup completed');
}

function setupLocationAutocomplete(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    
    if (!input || !dropdown) {
        console.warn(`Autocomplete setup failed for ${inputId}`);
        return;
    }
    
    console.log(`Setting up autocomplete for ${inputId}`);
    
    input.addEventListener('input', function(e) {
        const value = this.value.toLowerCase();
        console.log(`Input changed: ${value}`);
        
        if (value.length < 1) {
            dropdown.classList.remove('show');
            return;
        }
        
        const matches = APP_DATA.locations.filter(location => 
            location.name.toLowerCase().includes(value)
        );
        
        if (matches.length > 0) {
            dropdown.innerHTML = matches.map(location => 
                `<div class="dropdown-item" data-location="${location.name}">${location.name}</div>`
            ).join('');
            
            // Add click handlers to dropdown items
            dropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', function() {
                    selectLocation(inputId, this.dataset.location);
                });
            });
            
            dropdown.classList.add('show');
        } else {
            dropdown.classList.remove('show');
        }
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
    
    // Prevent dropdown from hiding when clicking on it
    dropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// ===========================================
// UI EVENT HANDLERS
// ===========================================

// Tab Management - FIXED
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Update navigation - remove active from all, add to current
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Find and activate the clicked tab
    const clickedTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (clickedTab) {
        clickedTab.classList.add('active');
    }
    
    // Update sections - hide all, show current
    document.querySelectorAll('.pattern-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${tabName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        currentTab = tabName;
        console.log('Tab switched successfully to:', tabName);
    } else {
        console.error('Section not found:', `${tabName}-section`);
    }
}

// Search Functions - FIXED
function selectLocation(inputId, locationName) {
    console.log(`Selecting location: ${locationName} for ${inputId}`);
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(inputId.replace('-location', '-dropdown'));
    
    if (input) {
        input.value = locationName;
        console.log(`Location set: ${input.value}`);
    }
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

function swapLocations() {
    const fromInput = document.getElementById('from-location');
    const toInput = document.getElementById('to-location');
    
    if (fromInput && toInput) {
        const temp = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = temp;
        console.log('Locations swapped');
    }
}

function searchRides() {
    const fromLocation = document.getElementById('from-location')?.value || '';
    const toLocation = document.getElementById('to-location')?.value || '';
    const maxDistance = parseInt(document.getElementById('max-distance')?.value) || 25;
    const fareType = document.querySelector('input[name="fare-type"]:checked')?.value || 'Normal';
    
    console.log('Search initiated with:', { fromLocation, toLocation, maxDistance, fareType });
    
    if (searchEngine) {
        searchEngine.searchRides(fromLocation, toLocation, maxDistance, fareType);
    } else {
        showToast('Search engine not initialized', 'error');
    }
}

function bookRideFromSearch(rideId) {
    const ride = searchEngine?.searchResults.find(r => r.id === rideId);
    if (ride && commandManager && rideService) {
        const command = new BookRideCommand(rideService, {
            from: ride.from,
            to: ride.to,
            fare: ride.fare,
            driverId: ride.driverId
        });
        commandManager.execute(command);
        
        // Switch to command tab to show the booked ride
        switchTab('command');
    }
}

// Observer Pattern Functions
function updateDriverStatus(status) {
    console.log(`Updating driver status to: ${status}`);
    if (driver) {
        driver.setStatus(status);
    }
}

function addRider() {
    const nameInput = document.getElementById('new-rider-name');
    if (!nameInput) return;
    
    const name = nameInput.value.trim();
    
    if (name) {
        const newRider = new Rider(Date.now(), name, true);
        riders.push(newRider);
        if (driver) {
            driver.addObserver(newRider);
        }
        nameInput.value = '';
        updateRidersList();
        showToast(`Added rider: ${name}`, 'success');
    }
}

function toggleRiderSubscription(riderId) {
    const rider = riders.find(r => r.id === riderId);
    if (rider && driver) {
        if (rider.subscribed) {
            rider.unsubscribe();
            driver.removeObserver(rider);
        } else {
            rider.subscribe();
            driver.addObserver(rider);
        }
        updateRidersList();
        showToast(`${rider.name} ${rider.subscribed ? 'subscribed' : 'unsubscribed'}`, 'info');
    }
}

function updateRidersList() {
    const ridersList = document.getElementById('riders-list');
    if (!ridersList) return;
    
    ridersList.innerHTML = '';
    
    riders.forEach(rider => {
        const riderElement = document.createElement('div');
        riderElement.className = `rider-item ${rider.subscribed ? 'subscribed' : ''}`;
        riderElement.innerHTML = `
            <span>${rider.name}</span>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="rider-subscription ${rider.subscribed ? 'active' : 'inactive'}">
                    ${rider.subscribed ? '🔔 Subscribed' : '🔕 Unsubscribed'}
                </span>
                <button type="button" class="btn btn--sm btn--outline rider-toggle-btn" data-rider-id="${rider.id}">
                    ${rider.subscribed ? 'Unsubscribe' : 'Subscribe'}
                </button>
            </div>
        `;
        
        // Add event listener to toggle button
        const toggleBtn = riderElement.querySelector('.rider-toggle-btn');
        toggleBtn.addEventListener('click', function() {
            toggleRiderSubscription(parseInt(this.dataset.riderId));
        });
        
        ridersList.appendChild(riderElement);
    });
}

// Strategy Pattern Functions
function calculateAllStrategies() {
    const distanceInput = document.getElementById('distance');
    const baseFareInput = document.getElementById('base-fare');
    
    if (!distanceInput || !baseFareInput) {
        return; // Don't show error during initialization
    }
    
    const distance = parseFloat(distanceInput.value);
    const baseFare = parseFloat(baseFareInput.value);
    
    if (isNaN(distance) || isNaN(baseFare) || distance <= 0 || baseFare <= 0) {
        return; // Don't show error for empty/invalid values
    }
    
    const strategies = [
        { name: 'Normal', strategy: new NormalFareStrategy(), id: 'normal-price' },
        { name: 'Surge', strategy: new SurgeFareStrategy(), id: 'surge-price' },
        { name: 'Discount', strategy: new DiscountFareStrategy(), id: 'discount-price' }
    ];
    
    const results = [];
    
    strategies.forEach(({ name, strategy, id }) => {
        const calculator = new FareCalculator();
        calculator.setStrategy(strategy);
        const fare = calculator.calculateFare(baseFare, distance);
        const info = calculator.getStrategyInfo();
        
        // Update price display
        const priceElement = document.getElementById(id);
        if (priceElement) {
            priceElement.textContent = `₹${fare.toFixed(2)}`;
        }
        
        results.push({
            name,
            multiplier: info.multiplier,
            baseCost: baseFare * distance,
            totalFare: fare,
            savings: (strategies[0].strategy.calculate(baseFare, distance) - fare)
        });
    });
    
    updateComparisonTable(results);
}

function selectStrategy(strategyName) {
    // Remove previous selection
    document.querySelectorAll('.strategy-card-visual').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked strategy
    const strategyCard = document.querySelector(`.strategy-card-visual.${strategyName.toLowerCase()}`);
    if (strategyCard) {
        strategyCard.classList.add('selected');
        showToast(`Selected ${strategyName} pricing strategy`, 'info');
    }
}

function updateComparisonTable(results) {
    const tbody = document.getElementById('comparison-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = results.map(result => `
        <tr>
            <td><strong>${result.name}</strong></td>
            <td>${result.multiplier}x</td>
            <td>₹${result.baseCost.toFixed(2)}</td>
            <td><strong>₹${result.totalFare.toFixed(2)}</strong></td>
            <td class="${result.savings > 0 ? 'savings-positive' : result.savings < 0 ? 'savings-negative' : ''}">
                ${result.savings > 0 ? '+' : ''}₹${result.savings.toFixed(2)}
            </td>
        </tr>
    `).join('');
}

// Command Pattern Functions
function executeCommand(operation) {
    if (!rideService || !commandManager) return;
    
    let command;
    
    switch (operation) {
        case 'book':
            command = new BookRideCommand(rideService);
            break;
        case 'cancel':
            command = new CancelRideCommand(rideService);
            break;
        case 'rate':
            command = new RateRideCommand(rideService);
            break;
        case 'search':
            command = new SearchRidesCommand(rideService);
            break;
        default:
            showToast('Unknown operation', 'error');
            return;
    }
    
    commandManager.execute(command);
}

function undoCommand() {
    if (commandManager) {
        commandManager.undo();
    }
}

function redoCommand() {
    if (commandManager) {
        commandManager.redo();
    }
}

// Utility Functions
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.log('Toast:', message); // Fallback to console
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remove toast after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

function showLoading(show) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.add('show');
        } else {
            loadingOverlay.classList.remove('show');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing RideMax Pro');
    
    // Wait a bit for all elements to be fully rendered
    setTimeout(() => {
        initializeApp();
        
        // Calculate initial strategies
        setTimeout(() => {
            calculateAllStrategies();
        }, 500);
        
        // Show welcome message
        setTimeout(() => {
            showToast('Welcome to RideMax Pro! Start by searching for rides.', 'success');
        }, 1000);
    }, 100);
});