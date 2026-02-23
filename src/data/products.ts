export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  brand: string;
  inStock: boolean;
  lowStock?: boolean;
  image: string;
  images?: string[];
  specs?: Record<string, string>;
  compatibility?: string[];
}

export const categories = [
  { name: "Engine Parts", icon: "Cog", count: 156 },
  { name: "Brake Systems", icon: "Disc3", count: 89 },
  { name: "Electrical Parts", icon: "Zap", count: 124 },
  { name: "Body Parts", icon: "Car", count: 203 },
  { name: "Suspension", icon: "ArrowUpDown", count: 67 },
  { name: "Filters & Fluids", icon: "Droplets", count: 98 },
];

export const brands = [
  "Toyota", "Honda", "BMW", "Mercedes-Benz", "Ford",
  "Chevrolet", "Nissan", "Hyundai", "Volkswagen", "Audi",
  "Kia", "Mazda", "Subaru", "Volvo",
];

export const products: Product[] = [
  {
    id: "1",
    name: "Premium Oil Filter",
    description: "High-quality oil filter for optimal engine performance. Compatible with most sedan models.",
    price: 12.99,
    originalPrice: 18.99,
    rating: 4.5,
    reviewCount: 234,
    category: "Filters & Fluids",
    brand: "Toyota",
    inStock: true,
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop",
    specs: { "Filter Type": "Spin-on", "Height": "3.5 inches", "Thread Size": "M20 x 1.5", "Material": "Steel" },
    compatibility: ["Toyota Camry 2015-2024", "Toyota Corolla 2014-2024", "Honda Civic 2016-2024"],
  },
  {
    id: "2",
    name: "Ceramic Brake Pad Set",
    description: "Low-dust ceramic brake pads for quiet, smooth braking. Front axle set.",
    price: 45.99,
    originalPrice: 59.99,
    rating: 4.8,
    reviewCount: 189,
    category: "Brake Systems",
    brand: "BMW",
    inStock: true,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop",
    specs: { "Position": "Front", "Material": "Ceramic", "Pieces": "4", "Noise Level": "Ultra-quiet" },
    compatibility: ["BMW 3 Series 2012-2024", "BMW 5 Series 2010-2024"],
  },
  {
    id: "3",
    name: "LED Headlight Bulb Kit",
    description: "Ultra-bright 6000K LED headlight conversion kit. Plug-and-play installation.",
    price: 34.99,
    rating: 4.3,
    reviewCount: 156,
    category: "Electrical Parts",
    brand: "Universal",
    inStock: true,
    image: "https://images.unsplash.com/photo-1616788494672-ec7ca25fdda9?w=400&h=400&fit=crop",
    specs: { "Color Temperature": "6000K", "Lumens": "12000", "Wattage": "55W", "Lifespan": "50,000 hours" },
    compatibility: ["Universal fit - H11/H9/H8"],
  },
  {
    id: "4",
    name: "Alternator Assembly",
    description: "Remanufactured alternator with high output. Includes pulley and fan.",
    price: 189.99,
    originalPrice: 249.99,
    rating: 4.6,
    reviewCount: 78,
    category: "Engine Parts",
    brand: "Ford",
    inStock: true,
    lowStock: true,
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=400&fit=crop",
    specs: { "Output": "150A", "Voltage": "12V", "Rotation": "CW", "Pulley": "6-groove" },
    compatibility: ["Ford F-150 2015-2023", "Ford Explorer 2016-2023"],
  },
  {
    id: "5",
    name: "Shock Absorber Pair",
    description: "Gas-charged twin-tube shock absorbers. Improved handling and comfort.",
    price: 79.99,
    rating: 4.4,
    reviewCount: 112,
    category: "Suspension",
    brand: "Honda",
    inStock: true,
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop",
    specs: { "Type": "Twin-tube", "Gas": "Nitrogen", "Position": "Front", "Quantity": "Pair" },
    compatibility: ["Honda Accord 2013-2024", "Honda CR-V 2012-2024"],
  },
  {
    id: "6",
    name: "Side Mirror Assembly",
    description: "Complete side mirror replacement with heated glass and turn signal.",
    price: 65.99,
    originalPrice: 89.99,
    rating: 4.2,
    reviewCount: 67,
    category: "Body Parts",
    brand: "Hyundai",
    inStock: true,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop",
    specs: { "Side": "Driver", "Heated": "Yes", "Signal": "LED", "Power": "Electric" },
    compatibility: ["Hyundai Tucson 2016-2024", "Hyundai Santa Fe 2013-2024"],
  },
  {
    id: "7",
    name: "Spark Plug Set (4pc)",
    description: "Iridium-tipped spark plugs for improved fuel efficiency and performance.",
    price: 24.99,
    originalPrice: 32.99,
    rating: 4.7,
    reviewCount: 298,
    category: "Engine Parts",
    brand: "Nissan",
    inStock: true,
    image: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400&h=400&fit=crop",
    specs: { "Type": "Iridium", "Gap": "0.044\"", "Quantity": "4", "Thread": "14mm" },
    compatibility: ["Nissan Altima 2013-2024", "Nissan Rogue 2014-2024", "Toyota Camry 2012-2024"],
  },
  {
    id: "8",
    name: "Air Filter Element",
    description: "High-flow air filter for better engine breathing and acceleration.",
    price: 15.99,
    rating: 4.1,
    reviewCount: 187,
    category: "Filters & Fluids",
    brand: "Volkswagen",
    inStock: false,
    image: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400&h=400&fit=crop",
    specs: { "Type": "Panel", "Material": "Cotton Gauze", "Filtration": "99.5%", "Washable": "Yes" },
    compatibility: ["VW Golf 2015-2024", "VW Jetta 2015-2024", "Audi A3 2014-2024"],
  },
];

export const testimonials = [
  {
    name: "James Carter",
    role: "Fleet Manager",
    text: "MIKA GLOBLE has been our go-to supplier for over 3 years. The quality is consistently excellent and delivery is always on time.",
    rating: 5,
  },
  {
    name: "Sarah Mitchell",
    role: "Auto Shop Owner",
    text: "Outstanding selection of parts at competitive prices. Their customer service team is incredibly knowledgeable and helpful.",
    rating: 5,
  },
  {
    name: "David Okonkwo",
    role: "Independent Mechanic",
    text: "I switched to MIKA GLOBLE after years with another supplier. The difference in part quality is immediately noticeable.",
    rating: 4,
  },
  {
    name: "Maria Santos",
    role: "Car Enthusiast",
    text: "Easy ordering process and fast shipping. Found hard-to-find parts for my classic car restoration project.",
    rating: 5,
  },
];
