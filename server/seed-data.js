require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Load = require('./models/Load');
const Bid = require('./models/Bid');
const Transaction = require('./models/Transaction');
const Benefit = require('./models/Benefit');

// MongoDB Connection Configuration
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });
    console.log('MongoDB connected successfully');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    return false;
  }
};

// Clear all existing data
const clearData = async () => {
  try {
    await Transaction.deleteMany({});
    console.log('All transactions deleted');

    await Benefit.deleteMany({});
    console.log('All benefits deleted');

    await Bid.deleteMany({});
    console.log('All bids deleted');
    
    await Load.deleteMany({});
    console.log('All loads deleted');
    
    await User.deleteMany({});
    console.log('All users deleted');
    
    console.log('Database cleared successfully');
  } catch (err) {
    console.error('Error clearing data:', err.message);
  }
};

// Create sample users with realistic company names and histories
const createUsers = async () => {
  try {
    // Create admin users
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@freightflow.com',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date('2012-01-01')
    });

    const superAdmin = new User({
      name: 'Operations Director',
      email: 'director@freightflow.com',
      password: 'super123',
      role: 'superadmin',
      createdAt: new Date('2012-01-01')
    });

    await admin.save();
    await superAdmin.save();
    console.log('Admin users created');
    
    // Create shipper companies with historical data
    const shippers = [
      {
        name: 'ABC Logistics International',
        email: 'operations@abclogistics.com',
        companySize: 'Large',
        yearFounded: 2010
      },
      {
        name: 'FastFreight Solutions Inc.',
        email: 'dispatch@fastfreight.com',
        companySize: 'Medium',
        yearFounded: 2013
      },
      {
        name: 'Global Cargo Express',
        email: 'shipping@globalcargo.com',
        companySize: 'Large',
        yearFounded: 2011
      },
      {
        name: 'Swift Supply Chain Services',
        email: 'operations@swiftsupply.com',
        companySize: 'Medium',
        yearFounded: 2014
      },
      {
        name: 'Prime Shipping Corporation',
        email: 'logistics@primeship.com',
        companySize: 'Large',
        yearFounded: 2012
      },
      {
        name: 'Elite Transport Systems',
        email: 'dispatch@elitetransport.com',
        companySize: 'Medium',
        yearFounded: 2015
      },
      {
        name: 'Rapid Freight Services',
        email: 'operations@rapidfreight.com',
        companySize: 'Small',
        yearFounded: 2016
      }
    ];

    const shipperIds = [];
    for (const shipperData of shippers) {
      const shipper = new User({
        name: shipperData.name,
        email: shipperData.email,
        password: 'shipper123',
        role: 'shipper',
        status: 'active',
        companySize: shipperData.companySize,
        createdAt: new Date(shipperData.yearFounded + '-01-01'),
        totalLoads: Math.floor(Math.random() * 5000) + 1000,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        verificationDate: new Date(shipperData.yearFounded + '-02-01')
      });
      await shipper.save();
      shipperIds.push(shipper._id);
    }
    console.log('Shipper companies created');
    
    // Create trucker profiles with varied experience
    const truckers = [
      {
        name: 'Robert Johnson Trucking',
        email: 'robert@johnsontrucking.com',
        experience: 15,
        fleetSize: 'Medium'
      },
      {
        name: 'Martinez Freight Services',
        email: 'carlos@martinezfreight.com',
        experience: 8,
        fleetSize: 'Small'
      },
      {
        name: 'Wilson Transportation LLC',
        email: 'david@wilsontrans.com',
        experience: 12,
        fleetSize: 'Large'
      },
      {
        name: 'Smith Brothers Logistics',
        email: 'john@smithbrothers.com',
        experience: 20,
        fleetSize: 'Medium'
      },
      {
        name: 'Anderson Hauling Co.',
        email: 'mike@andersonhauling.com',
        experience: 6,
        fleetSize: 'Small'
      },
      {
        name: 'Pacific Route Carriers',
        email: 'james@pacificroute.com',
        experience: 10,
        fleetSize: 'Medium'
      },
      {
        name: 'Thompson Trucking Enterprise',
        email: 'william@thompsontrucking.com',
        experience: 18,
        fleetSize: 'Large'
      }
    ];

    const truckerIds = [];
    for (const truckerData of truckers) {
      const startYear = 2023 - truckerData.experience;
      const trucker = new User({
        name: truckerData.name,
        email: truckerData.email,
        password: 'trucker123',
        role: 'trucker',
        status: 'active',
        accidents: Math.floor(Math.random() * 2),
        theftComplaints: 0,
        truckAge: Math.floor(Math.random() * 5) + 1,
        driversLicenseYears: truckerData.experience,
        fleetSize: truckerData.fleetSize,
        isVerified: true,
        benefitsEligible: truckerData.experience >= 10,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        completedLoads: Math.floor(Math.random() * 3000) + 500,
        createdAt: new Date(startYear + '-01-01'),
        verificationDate: new Date(startYear + '-02-01')
      });
      await trucker.save();
      truckerIds.push(trucker._id);
    }
    console.log('Trucker profiles created');
    
    return {
      admin: admin._id,
      superAdmin: superAdmin._id,
      shippers: shipperIds,
      truckers: truckerIds
    };
  } catch (err) {
    console.error('Error creating users:', err.message);
    return null;
  }
};

// Create historical load data
const createLoads = async (userIds) => {
  try {
    const loads = [];
    const startYear = 2012;
    const currentYear = new Date().getFullYear();

    const cities = [
      'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
      'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
      'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL',
      'Fort Worth, TX', 'Columbus, OH', 'San Francisco, CA', 'Charlotte, NC',
      'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC'
    ];

    const loadTypes = ['Full Truckload', 'Less than Truckload', 'Refrigerated', 'Flatbed', 'Specialized'];
    const equipmentTypes = ['Box Truck', 'Semi-Trailer', 'Refrigerated Trailer', 'Flatbed Trailer', 'Specialized'];

    // Create historical loads
    for (let year = startYear; year <= currentYear; year++) {
      const loadsPerYear = Math.floor(Math.random() * 1000) + 500;
      
      for (let i = 0; i < loadsPerYear; i++) {
        const origin = cities[Math.floor(Math.random() * cities.length)];
        let destination;
        do {
          destination = cities[Math.floor(Math.random() * cities.length)];
        } while (destination === origin);

        const loadType = loadTypes[Math.floor(Math.random() * loadTypes.length)];
        const equipment = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
        const weight = Math.floor(Math.random() * 40000) + 5000;
        const rate = (Math.random() * 5000 + 1000).toFixed(2);

        const loadDate = new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const shipper = userIds.shippers[Math.floor(Math.random() * userIds.shippers.length)];
        const trucker = Math.random() > 0.1 ? userIds.truckers[Math.floor(Math.random() * userIds.truckers.length)] : null;

        const load = new Load({
          shipper,
          trucker,
          origin,
          destination,
          pickupDate: loadDate,
          deliveryDate: new Date(loadDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
          status: trucker ? (Math.random() > 0.1 ? 'completed' : 'in_transit') : 'pending',
          weight,
          rate,
          loadType,
          equipmentType: equipment,
          specialRequirements: loadType === 'Specialized' ? 'Special handling required' : '',
          createdAt: loadDate
        });

        loads.push(load);

        // Create bids for pending loads
        if (!trucker) {
          const numBids = Math.floor(Math.random() * 5) + 1;
          for (let j = 0; j < numBids; j++) {
            const bidder = userIds.truckers[Math.floor(Math.random() * userIds.truckers.length)];
            const bidAmount = parseFloat(rate) * (0.8 + Math.random() * 0.4); // 80-120% of rate
            const bid = new Bid({
              load: load._id,
              trucker: bidder,
              amount: bidAmount.toFixed(2),
              status: 'pending',
              createdAt: loadDate
            });
            await bid.save();
          }
        }
      }
    }

    await Load.insertMany(loads);
    console.log('Historical loads and bids created');

    return loads;
  } catch (err) {
    console.error('Error creating loads:', err.message);
    return null;
  }
};

// Create benefits data
const createBenefits = async () => {
  try {
    const benefits = [
      {
        name: 'Premium Health Insurance',
        description: 'Comprehensive health coverage for truckers and their families',
        type: 'insurance',
        provider: 'TruckerHealth Plus',
        coverage: '80% of medical expenses',
        eligibilityCriteria: 'Minimum 2 years of service',
        startDate: new Date('2012-03-01'),
        status: 'active'
      },
      {
        name: 'Tire Replacement Program',
        description: '50% discount on tire replacements',
        type: 'discount',
        provider: 'National Tire Network',
        coverage: '50% off market price',
        eligibilityCriteria: 'All verified truckers',
        startDate: new Date('2013-01-15'),
        status: 'active'
      },
      {
        name: 'Maintenance Service Package',
        description: 'Regular maintenance service at discounted rates',
        type: 'service',
        provider: 'TruckCare Services',
        coverage: '30% off service charges',
        eligibilityCriteria: 'Active membership required',
        startDate: new Date('2014-06-01'),
        status: 'active'
      },
      {
        name: 'Fuel Savings Program',
        description: 'Discounted fuel rates at partner stations',
        type: 'discount',
        provider: 'National Fuel Network',
        coverage: 'Up to $0.50 off per gallon',
        eligibilityCriteria: 'All active truckers',
        startDate: new Date('2015-04-01'),
        status: 'active'
      },
      {
        name: 'Rest Stop Premium Access',
        description: 'Premium facilities access at partner rest stops',
        type: 'service',
        provider: 'RestStop Plus',
        coverage: 'Free premium facilities access',
        eligibilityCriteria: 'Minimum 1 year of service',
        startDate: new Date('2016-09-01'),
        status: 'active'
      }
    ];

    await Benefit.insertMany(benefits);
    console.log('Benefits created');

    return benefits;
  } catch (err) {
    console.error('Error creating benefits:', err.message);
    return null;
  }
};

// Create transaction history
const createTransactions = async (userIds, loads) => {
  try {
    const transactions = [];
    for (const load of loads) {
      if (load.trucker) {
        const transaction = new Transaction({
          shipper: load.shipper,
          trucker: load.trucker,
          load: load._id,
          amount: load.rate,
          status: 'completed',
          createdAt: load.pickupDate
        });
        transactions.push(transaction);
      }
    }
    await Transaction.insertMany(transactions);
    console.log('Transaction history created');
    return transactions;
  } catch (err) {
    console.error('Error creating transactions:', err.message);
    return null;
  }
};