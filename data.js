// data.js
// Central data store for all zoo animals and places

const zooData = {
    animals: [
        { 
            id: 'elephant', 
            name: 'Elephants', 
            coords: { x: 220, y: 180 }, 
            page: 'elephants.html', 
            icon: '🐘',
            description: 'Gentle giants of the jungle',
            location: 'E22',
            viewTime: 15,
            category: 'mammal'
        },
        { 
            id: 'giraffe', 
            name: 'Giraffes', 
            coords: { x: 350, y: 120 }, 
            page: 'giraffes.html', 
            icon: '🦒',
            description: 'Our giraffes love company',
            location: 'G15',
            viewTime: 10,
            category: 'mammal'
        },
        { 
            id: 'lion', 
            name: 'Lions', 
            coords: { x: 480, y: 80 }, 
            page: 'lions.html', 
            icon: '🦁',
            description: 'The king of the jungle awaits your visit',
            location: 'Northern Frontier',
            viewTime: 20,
            category: 'mammal'
        },
        { 
            id: 'panda', 
            name: 'Pandas', 
            coords: { x: 520, y: 220 }, 
            page: 'pandas.html', 
            icon: '🐼',
            description: 'The pandas seem to be everyone\'s favorite',
            location: 'Panda Canyon',
            viewTime: 15,
            category: 'mammal'
        },
        { 
            id: 'koala', 
            name: 'Koalas', 
            coords: { x: 280, y: 280 }, 
            page: 'koalas.html', 
            icon: '🐨',
            description: 'Come take a look at the cute koalas',
            location: 'Near giraffe enclosure',
            viewTime: 10,
            category: 'mammal'
        },
        { 
            id: 'gorilla', 
            name: 'Gorillas', 
            coords: { x: 150, y: 320 }, 
            page: 'gorilla.html', 
            icon: '🦍',
            description: 'Kong the gorilla is much friendlier than he looks',
            location: 'GO12',
            viewTime: 15,
            category: 'mammal'
        },
        { 
            id: 'monkey', 
            name: 'Monkeys', 
            coords: { x: 400, y: 350 }, 
            page: 'monkey.html', 
            icon: '🐒',
            description: 'Playful monkeys are cleverer than you think',
            location: 'Near Monkey Trail',
            viewTime: 10,
            category: 'mammal'
        },
        { 
            id: 'gemsbok', 
            name: 'Gemsboks', 
            coords: { x: 580, y: 300 }, 
            page: 'gemsbok.html', 
            icon: '🐐',
            description: 'Come and see the majestic Gemsbok',
            location: 'Beyond Panda Canyon',
            viewTime: 10,
            category: 'mammal'
        },
        { 
            id: 'warthog', 
            name: 'Warthogs', 
            coords: { x: 180, y: 420 }, 
            page: 'warthog.html', 
            icon: '🐗',
            description: 'Find out more about this funny-looking fellow',
            location: 'WA11',
            viewTime: 8,
            category: 'mammal'
        }
    ],
    
    places: [
        { 
            id: 'amphitheatre', 
            name: 'Amphitheatre', 
            coords: { x: 320, y: 60 }, 
            page: 'amphitheatre.html', 
            icon: '🎪',
            description: 'Catch an educational and entertaining event',
            type: 'entertainment'
        },
        { 
            id: 'insect', 
            name: 'Insect House', 
            coords: { x: 620, y: 180 }, 
            page: 'insect.html', 
            icon: '🐛',
            description: 'Creepy crawlies of every kind you can imagine',
            type: 'attraction'
        },
        { 
            id: 'monkeytrail', 
            name: 'Monkey Trail', 
            coords: { x: 450, y: 400 }, 
            page: 'monkeytrail.html', 
            icon: '🥾',
            description: 'Take a walk through this challenging obstacle course',
            type: 'activity'
        },
        { 
            id: 'lostforest', 
            name: 'Lost Forest', 
            coords: { x: 550, y: 450 }, 
            page: 'lostforest.html', 
            icon: '🌳',
            description: 'Relax and have a picnic under the trees',
            type: 'picnic'
        },
        { 
            id: 'mospizza', 
            name: 'Mo\'s Pizza', 
            coords: { x: 250, y: 200 }, 
            page: 'mospizza.html', 
            icon: '🍕',
            description: 'Scrumptious Pizzas and Pastas',
            type: 'restaurant'
        },
        { 
            id: 'dinezoo', 
            name: 'Dine @The Zoo', 
            coords: { x: 290, y: 140 }, 
            page: 'dinezoo.html', 
            icon: '🍽️',
            description: 'Enjoy gourmet meals in a serene setting',
            type: 'restaurant'
        },
        { 
            id: 'wilshop', 
            name: 'Wild Things Coffee Shop', 
            coords: { x: 230, y: 240 }, 
            page: 'wilshop.html', 
            icon: '☕',
            description: 'Enjoy a cuppa or a dessert here',
            type: 'cafe'
        }
    ]
};

// Helper function to get all locations (animals + places)
function getAllLocations() {
    return [...zooData.animals, ...zooData.places];
}

// Helper function to get location by ID
function getLocationById(id) {
    return getAllLocations().find(loc => loc.id === id);
}

// Add to data.js - Visit planner specific data

// Sample walking times between locations (in minutes)
const walkingTimes = {
    // This is a simplified matrix - in real app would be more comprehensive
    elephant: { giraffe: 5, lion: 8, panda: 10, amphitheatre: 3 },
    giraffe: { elephant: 5, lion: 4, panda: 7, amphitheatre: 6 },
    lion: { elephant: 8, giraffe: 4, panda: 5, amphitheatre: 9 },
    panda: { elephant: 10, giraffe: 7, lion: 5, amphitheatre: 12 },
    amphitheatre: { elephant: 3, giraffe: 6, lion: 9, panda: 12 }
};

// Popular routes/tours
const recommendedTours = [
    {
        name: "Family Fun Tour",
        description: "Perfect for families with kids",
        locations: ['elephant', 'giraffe', 'panda', 'amphitheatre', 'mospizza'],
        duration: 180,
        difficulty: "Easy"
    },
    {
        name: "Wildlife Explorer",
        description: "See all the big cats and primates",
        locations: ['lion', 'gorilla', 'monkey', 'gemsbok', 'lostforest'],
        duration: 240,
        difficulty: "Moderate"
    },
    {
        name: "Quick Visit",
        description: "See the highlights in 2 hours",
        locations: ['elephant', 'giraffe', 'panda', 'amphitheatre'],
        duration: 120,
        difficulty: "Easy"
    }
];