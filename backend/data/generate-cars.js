import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

// Unsplash IDs for real car photos (by category)
const UNSPLASH_IMAGES = {
  Supercar: [
    'photo-1503376780353-7e6692767b70', // Porsche 911
    'photo-1583121274602-3e2820c69888', // Ferrari
    'photo-1614162692292-7ac56d7f7f1e', // Lamborghini
    'photo-1562591176-80db4577da58', // McLaren
    'photo-1618843479313-40f8afb4b4d8', // Mercedes AMG GT
    'photo-1605559424843-9e4c228bf1c2', // Audi R8
    'photo-1544636331-e26879cd4d9b', // Lamborghini Huracan
    'photo-1525609004556-c46c7d6cf0a3', // Red Sportscar
    'photo-1542282088-fe8426682b8f', // Red luxury car
    'photo-1617531653332-bd46c24f2068'  // Aston Martin Valkyrie
  ],
  JDM: [
    'photo-1616422285623-13ff0162193c', // Toyota Supra
    'photo-1580273916550-e323be2ae537', // Nissan Skyline R34
    'photo-1607853202273-797f1c22a38e', // Nissan GT-R R35
    'photo-1594911774802-8822a7079af1', // Drift JDM Silvia
    'photo-1619682817481-e994891cd1f5', // Subaru Impreza
    'photo-1626847037657-fd3622613ce3', // Toyota GT86
    'photo-1617814076367-b759c7d7e738', // Honda Civic Type R
    'photo-1555215695-3004980ad54e', // Subaru BRZ
    'photo-1559416523-140ddc3d238c', // Classic Corolla JDM
    'photo-1606016159991-dfe4f2746ad5'  // Mazda RX-7
  ],
  Classic: [
    'photo-1517524008436-441799cf20a2', // Vintage Roadster Jaguar
    'photo-1580273916550-e323be2ae537', // Classic Silver Porsche 911
    'photo-1533473359331-0135ef1b58bf', // Vintage dash wood
    'photo-1527247043589-98e6ac08f56c', // Classic Mercedes Benz
    'photo-1502877338535-766e1452684a', // Classic Beetle
    'photo-1494976388531-d1058494cdd8', // Classic Ford Thunderbird
    'photo-1568605114967-8130f3a36994', // Vintage red sedan
    'photo-1552519507-da3b142c6e3d', // Vintage Corvette stingray
    'photo-1486496146582-9ffcd0b2b2b7', // Vintage blue pickup
    'photo-1549399542-7e3f8b79c341'  // Retro open-top
  ],
  Muscle: [
    'photo-1584438784894-089d6a128f3e', // Dodge Challenger SRT
    'photo-1611245801314-e0c5df922241', // Ford Mustang Shelby GT500
    'photo-1605559911160-a3d95d213904', // Chevrolet Camaro SS
    'photo-1620002093398-8f16081af5ee', // Dodge Charger RT
    'photo-1612462551868-450f3b0e1422', // Chevrolet Corvette C7
    'photo-1571607388263-1044f9ea01dd', // Red Corvette Z06
    'photo-1552519507-da3b142c6e3d', // Black Corvette Stingray
    'photo-1626645738196-c2a7c87a8f58', // Mustang Shelby Cobra
    'photo-1568605117036-5fe5e7bab0b7'  // Vintage Charger muscle
  ]
};

// Seed arrays to generate variations
const SUPERCAR_MODELS = [
  { brand: 'Porsche', name: '911 GT3 RS', desc: 'Precise track weapon replica with functional rear wing aero.' },
  { brand: 'Ferrari', name: 'LaFerrari Aperta', desc: 'Hybrid hypercar open-top limited edition replica.' },
  { brand: 'Lamborghini', name: 'Aventador SVJ', desc: 'V12 carbon active aerodynamics masterpiece.' },
  { brand: 'McLaren', name: 'Senna GTR', desc: 'Aggressive track-only aerodynamic replica design.' },
  { brand: 'Bugatti', name: 'Chiron Super Sport', desc: 'High-speed speed record variant die-cast replica.' },
  { brand: 'Koenigsegg', name: 'Jesko Absolut', desc: 'Megacar built for theoretical top speed records.' },
  { brand: 'Pagani', name: 'Huayra Roadster BC', desc: 'Sculptured carbon fiber luxury roadster.' },
  { brand: 'Aston Martin', name: 'Valkyrie AMR Pro', desc: 'F1-inspired track design with hyper-aggressive diffuser.' },
  { brand: 'Audi', name: 'R8 V10 Decennium', desc: 'Celebrating 10 years of atmospheric V10 performance.' },
  { brand: 'Mercedes-AMG', name: 'GT Black Series', desc: 'Record breaker active track aero replica.' }
];

const JDM_MODELS = [
  { brand: 'Nissan', name: 'Skyline GT-R R34 V-Spec II', desc: 'Iconic Bayside Blue Godzilla replica.' },
  { brand: 'Toyota', name: 'Supra RZ (A80)', desc: 'Legendary twin-turbo 2JZ JDM sports coupe.' },
  { brand: 'Honda', name: 'NSX-R (NA2)', desc: 'Championship White weight-reduced mid-engine classic.' },
  { brand: 'Mazda', name: 'RX-7 Spirit R Type A', desc: 'Sequentially turbocharged rotary engine legend.' },
  { brand: 'Subaru', name: 'Impreza WRX STI 22B', desc: 'Limited rally legend widebody blue replica.' },
  { brand: 'Mitsubishi', name: 'Lancer Evolution IX MR', desc: 'AWD rally bred sedan replica with active center diff.' },
  { brand: 'Toyota', name: 'AE86 Sprinter Trueno', desc: 'Fujiwara Tofu Shop pop-up headlight classic JDM.' },
  { brand: 'Honda', name: 'S2000 AP2 Mugen', desc: 'High-revving 9,000 RPM open-top roadster replica.' },
  { brand: 'Nissan', name: 'Silvia S15 Spec-R', desc: 'The ultimate drifting platform sports coupe.' },
  { brand: 'Mazda', name: 'RX-8 Spirit R', desc: 'Renesis rotary engine JDM suicide door sports coupe.' }
];

const CLASSIC_MODELS = [
  { brand: 'Aston Martin', name: 'DB5 Spyder (1964)', desc: 'British luxury spy classic with chrome spoked wheels.' },
  { brand: 'Jaguar', name: 'E-Type Roadster Series 1', desc: 'Enzo Ferrari declared this the most beautiful roadster.' },
  { brand: 'Mercedes-Benz', name: '300SL Gullwing', desc: 'Iconic Gullwing open-up doors classic replica.' },
  { brand: 'Chevrolet', name: 'Bel Air Convertible (1957)', desc: 'American golden-era cruiser replica with high chrome tailfins.' },
  { brand: 'Porsche', name: '356 A Speedster', desc: 'Minimalist classic open roadster in metallic silver.' },
  { brand: 'Ferrari', name: '250 GTO (1962)', desc: 'The most valuable collector sports car in the world.' },
  { brand: 'Ford', name: 'Thunderbird (1955)', desc: 'Luxury cruise classic roadster in turquoise pink paint.' },
  { brand: 'Chevrolet', name: 'Corvette Stingray Split Window', desc: '1963 iconic split rear window collector classic.' },
  { brand: 'Shelby', name: 'Cobra 427 S/C', desc: 'Vicious lightweight roadster with V8 engine replica.' },
  { brand: 'BMW', name: '507 Roadster', desc: 'Ultra-rare collector classic roadster finished in cream white.' }
];

const MUSCLE_MODELS = [
  { brand: 'Ford', name: 'Mustang Shelby GT500 Eleanor', desc: 'Gone in 60 Seconds customized muscle grey fastback.' },
  { brand: 'Dodge', name: 'Charger R/T (1970)', desc: 'Supercharged HEMI V8 blower classic muscle.' },
  { brand: 'Chevrolet', name: 'Camaro Z28 (1969)', desc: 'Rally stripes muscle coupe with detailed engine bay.' },
  { brand: 'Dodge', name: 'Challenger R/T SE (1970)', desc: 'Plum Crazy purple legendary drag strip muscle.' },
  { brand: 'Pontiac', name: 'GTO Judge (1969)', desc: 'Carousel Red muscle icon with rear wing spoiler.' },
  { brand: 'Plymouth', name: 'Hemi Cuda (1971)', desc: 'Shaker hood high-impact orange muscle replica.' },
  { brand: 'Pontiac', name: 'Firebird Trans Am (1977)', desc: 'Smokey & the Bandit gold screaming chicken hood muscle.' },
  { brand: 'Chevrolet', name: 'Chevelle SS 454 (1970)', desc: 'Cowl induction drag-strip V8 muscle replica.' },
  { brand: 'Dodge', name: 'Challenger SRT Demon', desc: 'Modern street-legal drag racing muscle monster.' },
  { brand: 'Ford', name: 'Mustang Boss 302 (1970)', desc: 'Grabber Blue trans-am racing series muscle classic.' }
];

// Scales list
const SCALES = ['1:18', '1:24', '1:43'];

// Generation logic
function generateCategory(category, templateModels, startingIdIndex) {
  const result = [];
  const imageIds = UNSPLASH_IMAGES[category] || UNSPLASH_IMAGES.Supercar;

  for (let i = 0; i < 50; i++) {
    const template = templateModels[i % templateModels.length];
    const imageId = imageIds[i % imageIds.length];
    
    // Generate slight variations in years/details to make all 50 unique
    const year = 1960 + (i * 3) % 65; // vary years
    const scale = SCALES[i % SCALES.length];
    
    let priceBase = 0;
    if (category === 'Supercar') priceBase = 150 + (i * 4.5) % 250; // $150 to $400 USD
    else if (category === 'JDM') priceBase = 70 + (i * 3) % 120;     // $70 to $190 USD
    else if (category === 'Classic') priceBase = 80 + (i * 3.5) % 180; // $80 to $260 USD
    else if (category === 'Muscle') priceBase = 60 + (i * 2.5) % 130;  // $60 to $190 USD

    // BDT Price (Conversion rate: 1 USD = 120 BDT)
    const priceBDT = Math.round(priceBase * 120);

    const suffix = i >= templateModels.length ? ` (Edition ${Math.floor(i / templateModels.length) + 1})` : '';

    result.push({
      id: `p${startingIdIndex + i}`,
      name: `${template.name}${suffix} - ${year}`,
      brand: template.brand,
      category: category,
      scale: scale,
      price: priceBDT,
      stock: 3 + (i * 7) % 22, // stock ranges from 3 to 24
      imageUrl: `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=600&q=80`,
      description: `${template.desc} This replica model features authentic chrome details, openable compartments, realistic interior detailing, rubber tires, and a display base.`
    });
  }

  return result;
}

function run() {
  console.log('Generating 200 high-performance car products...');
  
  const supercars = generateCategory('Supercar', SUPERCAR_MODELS, 1);       // p1 - p50
  const jdm = generateCategory('JDM', JDM_MODELS, 51);                     // p51 - p100
  const classics = generateCategory('Classic', CLASSIC_MODELS, 101);       // p101 - p150
  const muscle = generateCategory('Muscle', MUSCLE_MODELS, 151);           // p151 - p200

  const allProducts = [...supercars, ...jdm, ...classics, ...muscle];

  // Preserved users
  const users = [
    {
      id: "u1",
      name: "Velocraft Admin",
      email: "admin@velocraft.com",
      "password": "$2a$10$oDTAbo6qe2biK5d2ueh3leYA.mL61/xU5PEqTXVNOZKGVfBB.eTpe", // admin123
      "role": "admin"
    },
    {
      "id": "u2",
      "name": "Alex Mercer",
      "email": "shopper@velocraft.com",
      "password": "$2a$10$dCuqqhKgXC.oPM15B6KsRu1wgwGizAoI86shWxuNxh/U85GGYHCx2", // shopper123
      role: "customer"
    }
  ];

  // Converted sample orders
  const orders = [
    {
      id: "o1",
      userId: "u2",
      customerName: "Alex Mercer",
      customerEmail: "shopper@velocraft.com",
      items: [
        {
          productId: "p1",
          name: "Porsche 911 GT3 RS - 2022",
          brand: "Porsche",
          price: 18000,
          quantity: 1,
          imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"
        },
        {
          productId: "p56",
          name: "Toyota AE86 Sprinter Trueno - 1986",
          brand: "Toyota",
          price: 9600,
          quantity: 1,
          imageUrl: "https://images.unsplash.com/photo-1626847037657-fd3622613ce3?auto=format&fit=crop&w=600&q=80"
        }
      ],
      totalAmount: 27600,
      shippingAddress: {
        address: "123 Drift Circuit Drive",
        city: "Dhaka",
        state: "Dhaka Division",
        zipCode: "1205",
        country: "Bangladesh"
      },
      paymentMethod: "Credit Card (ending 4242)",
      status: "Shipped",
      createdAt: new Date().toISOString()
    }
  ];

  // Preserved support tickets
  const tickets = [
    {
      id: "t1",
      userId: "u2",
      customerName: "Alex Mercer",
      customerEmail: "shopper@velocraft.com",
      subject: "Headlights scale query",
      message: "Hi, does the pop-up headlights on the 1:24 AE86 model have working LED lights or are they manual flip-up only?",
      status: "In Progress",
      createdAt: new Date().toISOString(),
      replies: [
        {
          sender: "admin",
          message: "Hello Alex! The headlights are manual flip-up only. There are no active LEDs installed. However, the detailing inside the lenses is extremely high quality!",
          createdAt: new Date().toISOString()
        }
      ]
    }
  ];

  const dbData = {
    users,
    products: allProducts,
    orders,
    tickets
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
  console.log(`Successfully generated scaled database with 200 items (50 per category) at: ${DB_PATH}`);
}

run();
