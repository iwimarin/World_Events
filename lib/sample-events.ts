export const sampleEvents = [
  {
    _id: "sample-1",
    _creationTime: Date.now() - 86400000, // 1 day ago
    name: "ETH Warsaw",
    tagline: "Building the Future of Ethereum in the Heart of Europe",
    description: "Join us for the premier Ethereum event in Warsaw, bringing together developers, researchers, and enthusiasts to explore the latest in Web3 technology. Experience cutting-edge talks, hands-on workshops, and networking opportunities with the brightest minds in the Ethereum ecosystem.",
    start_date: "2024-09-05T09:00:00Z",
    end_date: "2024-09-07T18:00:00Z",
    location: {
      city: "Warsaw",
      country: "Poland"
    },
    type: {
      conference: true,
      hackathon: false
    },
    logo_url: "https://images.unsplash.com/photo-1618044733300-9472054094ee?w=400&h=300&fit=crop",
    socials: [
      "https://twitter.com/ethwarsaw",
      "https://github.com/ethwarsaw",
      "https://discord.gg/ethwarsaw"
    ],
    is_featured: true,
    status: "published" as const
  },
  {
    _id: "sample-2",
    _creationTime: Date.now() - 172800000, // 2 days ago
    name: "ETH Istanbul",
    tagline: "Bridging East and West: The Ethereum Community Gathering",
    description: "Istanbul's largest Ethereum conference bringing together builders, investors, and innovators from across Europe, Asia, and the Middle East. Discover new protocols, participate in governance discussions, and connect with the global Ethereum community.",
    start_date: "2024-09-12T08:00:00Z",
    end_date: "2024-09-14T20:00:00Z",
    location: {
      city: "Istanbul",
      country: "Turkey"
    },
    type: {
      conference: true,
      hackathon: true
    },
    logo_url: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=300&fit=crop",
    socials: [
      "https://twitter.com/ethistanbul",
      "https://t.me/ethistanbul",
      "https://linkedin.com/company/ethistanbul"
    ],
    is_featured: true,
    status: "published" as const
  },
  {
    _id: "sample-3",
    _creationTime: Date.now() - 259200000, // 3 days ago
    name: "ETH Safari",
    tagline: "Wild Adventures in Web3 - Kenya's Premier Ethereum Event",
    description: "Experience the growing African Web3 ecosystem at ETH Safari. Join us in Kenya for an immersive experience featuring local builders, sustainable blockchain solutions, and the future of decentralized finance in emerging markets.",
    start_date: "2024-09-20T10:00:00Z",
    end_date: "2024-09-22T19:00:00Z",
    location: {
      city: "Nairobi",
      country: "Kenya"
    },
    type: {
      conference: true,
      hackathon: true
    },
    logo_url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=300&fit=crop",
    socials: [
      "https://twitter.com/ethsafari",
      "https://instagram.com/ethsafari",
      "https://discord.gg/ethsafari"
    ],
    is_featured: false,
    status: "published" as const
  },
  {
    _id: "sample-4",
    _creationTime: Date.now() - 345600000, // 4 days ago
    name: "ETH Tokyo",
    tagline: "東京で繋がる未来のブロックチェーン - Connecting Japan's Web3 Future",
    description: "Tokyo's premier Ethereum conference showcasing Japan's unique approach to Web3 technology. Featuring presentations from leading Japanese blockchain companies, cultural workshops, and networking events in the heart of Tokyo.",
    start_date: "2024-10-01T09:00:00Z",
    end_date: "2024-10-03T17:00:00Z",
    location: {
      city: "Tokyo",
      country: "Japan"
    },
    type: {
      conference: true,
      hackathon: false
    },
    logo_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
    socials: [
      "https://twitter.com/ethtokyo",
      "https://github.com/ethtokyo",
      "https://youtube.com/ethtokyo"
    ],
    is_featured: false,
    status: "published" as const
  },
  {
    _id: "sample-5",
    _creationTime: Date.now() - 432000000, // 5 days ago
    name: "Ethereum Vienna",
    tagline: "Alpine Innovation: Web3 in the Austrian Capital",
    description: "Join the Austrian Ethereum community for an elegant conference in Vienna. Experience the perfect blend of classical architecture and cutting-edge blockchain technology, with talks on DeFi protocols, NFT innovations, and sustainable Web3 solutions.",
    start_date: "2024-10-10T09:30:00Z",
    end_date: "2024-10-12T16:00:00Z",
    location: {
      city: "Vienna",
      country: "Austria"
    },
    type: {
      conference: true,
      hackathon: false
    },
    logo_url: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400&h=300&fit=crop",
    socials: [
      "https://twitter.com/ethvienna",
      "https://linkedin.com/company/ethereum-vienna",
      "https://medium.com/@ethvienna"
    ],
    is_featured: false,
    status: "published" as const
  },
  {
    _id: "sample-6",
    _creationTime: Date.now() - 518400000, // 6 days ago
    name: "DeFi London",
    tagline: "Revolutionizing Finance in the City of London",
    description: "London's premier DeFi conference bringing together traditional finance and decentralized protocols. Learn from industry leaders, participate in governance discussions, and explore the future of financial infrastructure.",
    start_date: "2024-10-15T08:00:00Z",
    end_date: "2024-10-17T18:00:00Z",
    location: {
      city: "London",
      country: "United Kingdom"
    },
    type: {
      conference: true,
      hackathon: false
    },
    logo_url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop",
    socials: [
      "https://twitter.com/defilondon",
      "https://linkedin.com/company/defi-london",
      "https://discord.gg/defilondon"
    ],
    is_featured: true,
    status: "published" as const
  },
  {
    _id: "sample-7",
    _creationTime: Date.now() - 604800000, // 7 days ago
    name: "Web3 Summit Berlin",
    tagline: "Decentralized Future: Building the Next Internet",
    description: "Berlin's largest Web3 conference featuring the latest in decentralized technologies. Join developers, entrepreneurs, and thought leaders as they shape the future of the internet with blockchain, IPFS, and other Web3 protocols.",
    start_date: "2024-11-01T09:00:00Z",
    end_date: "2024-11-03T19:00:00Z",
    location: {
      city: "Berlin",
      country: "Germany"
    },
    type: {
      conference: true,
      hackathon: true
    },
    logo_url: "https://images.unsplash.com/photo-1587613757488-de7ba42ccd5f?w=400&h=300&fit=crop",
    socials: [
      "https://twitter.com/web3berlin",
      "https://github.com/web3berlin",
      "https://telegram.me/web3berlin"
    ],
    is_featured: false,
    status: "published" as const
  },
  {
    _id: "sample-8",
    _creationTime: Date.now() - 691200000, // 8 days ago
    name: "NFT NYC",
    tagline: "The Capital of Digital Art and Collectibles",
    description: "New York's premier NFT conference celebrating digital art, collectibles, and the creator economy. Featuring exhibitions from top artists, marketplace showcases, and discussions on the future of digital ownership.",
    start_date: "2024-11-10T10:00:00Z",
    end_date: "2024-11-12T20:00:00Z",
    location: {
      city: "New York",
      country: "United States"
    },
    type: {
      conference: true,
      hackathon: false
    },
    logo_url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    socials: [
      "https://twitter.com/nftnyc",
      "https://instagram.com/nftnyc",
      "https://discord.gg/nftnyc"
    ],
    is_featured: false,
    status: "published" as const
  }
];

// Sample function to simulate adding events to Convex
export const addSampleEventsToConvex = async (addEvent: any) => {
  for (const event of sampleEvents) {
    try {
      await addEvent(event);
      console.log(`Added event: ${event.name}`);
    } catch (error) {
      console.error(`Failed to add event ${event.name}:`, error);
    }
  }
}; 