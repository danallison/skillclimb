import type { SeedDomain, SeedTopic, SeedNode } from "../../../seed/types.js";

// ---------------------------------------------------------------------------
// Domain
// ---------------------------------------------------------------------------

export const domain: SeedDomain = {
  name: "Networking Fundamentals",
  tier: 0,
  description:
    "Core networking concepts including the OSI model, TCP/IP, DNS, DHCP, subnetting, ARP, common ports and protocols, and NAT/firewalls. These fundamentals underpin every area of cybersecurity.",
  prerequisites: [],
  displayOrder: 0,
};

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

export const topics: SeedTopic[] = [
  {
    name: "OSI Model",
    complexityWeight: 1.0,
    displayOrder: 0,
  },
  {
    name: "TCP/IP",
    complexityWeight: 1.2,
    displayOrder: 1,
  },
  {
    name: "DNS",
    complexityWeight: 1.1,
    displayOrder: 2,
  },
  {
    name: "DHCP",
    complexityWeight: 0.9,
    displayOrder: 3,
  },
  {
    name: "Ports & Protocols",
    complexityWeight: 1.0,
    displayOrder: 4,
  },
  {
    name: "Subnetting",
    complexityWeight: 1.4,
    displayOrder: 5,
  },
  {
    name: "ARP",
    complexityWeight: 1.0,
    displayOrder: 6,
  },
  {
    name: "NAT & Firewalls",
    complexityWeight: 1.2,
    displayOrder: 7,
  },
];

// ---------------------------------------------------------------------------
// Nodes
// ---------------------------------------------------------------------------

export const nodes: SeedNode[] = [
  // =======================================================================
  // OSI Model (5 nodes)
  // =======================================================================
  {
    topicName: "OSI Model",
    concept: "The seven layers of the OSI model and their order",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which layer of the OSI model is responsible for end-to-end communication and flow control between applications on different hosts?",
        choices: [
          "Network Layer (Layer 3)",
          "Transport Layer (Layer 4)",
          "Session Layer (Layer 5)",
          "Data Link Layer (Layer 2)",
        ],
        correctAnswer: "Transport Layer (Layer 4)",
        explanation:
          "The Transport Layer (Layer 4) provides end-to-end communication, flow control, and error recovery between applications. TCP and UDP operate at this layer.",
      },
      {
        type: "cued_recall",
        prompt:
          "Which OSI layer (by name and number) is responsible for end-to-end communication and flow control between hosts?",
        correctAnswer: "Transport Layer (Layer 4)",
        acceptableAnswers: [
          "Transport Layer",
          "Layer 4",
          "L4",
          "Transport",
          "the transport layer",
        ],
        hints: [
          "This layer sits between the Network Layer and the Session Layer.",
          "TCP and UDP are the two most well-known protocols at this layer.",
        ],
        explanation:
          "The Transport Layer (Layer 4) provides end-to-end communication, flow control, and error recovery between applications. TCP and UDP operate at this layer.",
      },
      {
        type: "free_recall",
        prompt:
          "List the seven layers of the OSI model in order from Layer 1 to Layer 7, and briefly describe the primary responsibility of each layer.",
        correctAnswer:
          "Layer 1 - Physical: Transmits raw bit streams over physical media. Layer 2 - Data Link: Frames data and handles MAC addressing for local delivery. Layer 3 - Network: Provides logical addressing (IP) and routes packets across networks. Layer 4 - Transport: Ensures end-to-end communication, flow control, and error recovery (TCP/UDP). Layer 5 - Session: Establishes, manages, and terminates sessions between applications. Layer 6 - Presentation: Translates data formats, handles encryption, and compression. Layer 7 - Application: Provides network services directly to end-user applications (HTTP, SMTP, FTP).",
        rubric:
          "A good answer should name all seven layers in the correct order and provide at least a brief description of what each layer does. Partial credit for correctly ordering most layers or describing most accurately.",
        keyPoints: [
          "All seven layers named in correct order from Physical (1) to Application (7)",
          "Physical Layer deals with raw bits and physical media",
          "Data Link Layer handles framing and MAC addresses",
          "Network Layer handles logical addressing (IP) and routing",
          "Transport Layer provides end-to-end communication via TCP/UDP",
        ],
        hints: [
          "A common mnemonic is 'Please Do Not Throw Sausage Pizza Away' (Physical, Data Link, Network, Transport, Session, Presentation, Application).",
          "The lower layers (1-4) handle data transport; the upper layers (5-7) handle application-level concerns.",
        ],
        explanation:
          "The Transport Layer (Layer 4) provides end-to-end communication, flow control, and error recovery between applications. TCP and UDP operate at this layer.",
      },
    ],
  },
  {
    topicName: "OSI Model",
    concept: "The role of the Physical Layer in the OSI model",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the Physical Layer (Layer 1) of the OSI model deal with?",
        choices: [
          "Logical addressing and routing between networks",
          "Transmission of raw bit streams over physical media",
          "Establishing, maintaining, and terminating sessions",
          "Data encryption and compression",
        ],
        correctAnswer: "Transmission of raw bit streams over physical media",
        explanation:
          "The Physical Layer is concerned with the transmission of raw, unstructured bit streams over a physical medium such as copper cables, fiber optics, or wireless radio frequencies.",
      },
      {
        type: "cued_recall",
        prompt:
          "What type of data does the Physical Layer (Layer 1) of the OSI model transmit, and over what kind of medium?",
        correctAnswer: "Raw bit streams over physical media",
        acceptableAnswers: [
          "Raw bits over physical media",
          "Bits over physical medium",
          "Bit streams over cables, fiber, or wireless",
          "Binary data over physical connections",
          "Raw bits",
        ],
        hints: [
          "Think about the most basic unit of digital data.",
          "This layer is concerned with hardware: cables, connectors, and signal voltages.",
        ],
        explanation:
          "The Physical Layer is concerned with the transmission of raw, unstructured bit streams over a physical medium such as copper cables, fiber optics, or wireless radio frequencies.",
      },
      {
        type: "free_recall",
        prompt:
          "Explain the role of the Physical Layer (Layer 1) in the OSI model. What does it handle, and what are some examples of Physical Layer components and standards?",
        correctAnswer:
          "The Physical Layer is the lowest layer of the OSI model. It handles the transmission of raw, unstructured bit streams over a physical medium. It defines electrical signals, voltages, pin layouts, data rates, and physical connectors. Examples include Ethernet cables (Cat5e, Cat6), fiber optic cables, Wi-Fi radio frequencies, USB connectors, and standards like IEEE 802.3 (Ethernet) and IEEE 802.11 (Wi-Fi). It does not interpret the meaning of the bits; it simply moves them from one device to another.",
        rubric:
          "A good answer should explain that Layer 1 deals with raw bit transmission over physical media, mention specific examples of physical media or standards, and note that this layer does not interpret data meaning.",
        keyPoints: [
          "Transmits raw bit streams without interpreting their meaning",
          "Defines electrical/optical signal characteristics and timing",
          "Includes physical media like copper cables, fiber optics, and wireless",
          "Covers connectors, pin layouts, voltages, and data rates",
          "Examples include Ethernet (IEEE 802.3) and Wi-Fi (IEEE 802.11)",
        ],
        hints: [
          "Think about what you can physically touch in a network: cables, ports, connectors.",
          "This layer converts digital bits into signals (electrical, optical, or radio).",
        ],
        explanation:
          "The Physical Layer is concerned with the transmission of raw, unstructured bit streams over a physical medium such as copper cables, fiber optics, or wireless radio frequencies.",
      },
    ],
  },
  {
    topicName: "OSI Model",
    concept:
      "The Data Link Layer and its role in framing and MAC addressing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which OSI layer is responsible for framing data and using MAC addresses to deliver frames within a local network segment?",
        choices: [
          "Physical Layer (Layer 1)",
          "Data Link Layer (Layer 2)",
          "Network Layer (Layer 3)",
          "Transport Layer (Layer 4)",
        ],
        correctAnswer: "Data Link Layer (Layer 2)",
        explanation:
          "The Data Link Layer packages raw bits into frames, handles MAC addressing, and manages access to the physical medium within a single network segment.",
      },
      {
        type: "cued_recall",
        prompt:
          "What type of address does the Data Link Layer (Layer 2) use to deliver frames within a local network segment?",
        correctAnswer: "MAC address",
        acceptableAnswers: [
          "MAC addresses",
          "Media Access Control address",
          "Hardware address",
          "Physical address",
          "Ethernet address",
          "Layer 2 address",
        ],
        hints: [
          "This is a 48-bit address typically written as six pairs of hexadecimal digits (e.g., AA:BB:CC:DD:EE:FF).",
          "It is burned into a network interface card (NIC) by the manufacturer.",
        ],
        explanation:
          "The Data Link Layer packages raw bits into frames, handles MAC addressing, and manages access to the physical medium within a single network segment.",
      },
      {
        type: "free_recall",
        prompt:
          "Describe the responsibilities of the Data Link Layer (Layer 2) in the OSI model. What are its key functions, and how does it relate to the layers above and below it?",
        correctAnswer:
          "The Data Link Layer sits between the Physical Layer (Layer 1) and the Network Layer (Layer 3). Its key responsibilities include: (1) Framing - packaging raw bits from the Physical Layer into structured frames with headers and trailers. (2) MAC Addressing - using 48-bit hardware addresses to identify source and destination devices on the local segment. (3) Media Access Control - managing how devices share access to the physical medium (e.g., CSMA/CD for Ethernet). (4) Error Detection - using mechanisms like CRC (Cyclic Redundancy Check) in the frame trailer to detect transmission errors. It is divided into two sublayers: LLC (Logical Link Control) and MAC (Media Access Control). Switches operate at this layer.",
        rubric:
          "A good answer should cover framing, MAC addressing, media access control, and error detection. Bonus for mentioning sublayers (LLC/MAC) or that switches operate at Layer 2.",
        keyPoints: [
          "Packages raw bits into structured frames with headers and trailers",
          "Uses MAC addresses (48-bit hardware addresses) for local delivery",
          "Manages shared access to the physical medium (media access control)",
          "Provides error detection via CRC or similar mechanisms",
          "Network switches are Layer 2 devices",
        ],
        hints: [
          "Think about what needs to happen between raw electrical signals and IP-level routing.",
          "This layer is where switches operate, forwarding frames based on hardware addresses.",
        ],
        explanation:
          "The Data Link Layer packages raw bits into frames, handles MAC addressing, and manages access to the physical medium within a single network segment.",
      },
    ],
  },
  {
    topicName: "OSI Model",
    concept: "The Network Layer and IP routing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which OSI layer is responsible for logical addressing and routing packets across different networks?",
        choices: [
          "Data Link Layer (Layer 2)",
          "Network Layer (Layer 3)",
          "Transport Layer (Layer 4)",
          "Application Layer (Layer 7)",
        ],
        correctAnswer: "Network Layer (Layer 3)",
        explanation:
          "The Network Layer handles logical addressing (IP addresses) and determines the best path for routing packets from source to destination across interconnected networks.",
      },
      {
        type: "cued_recall",
        prompt:
          "What type of addressing does the Network Layer (Layer 3) use to identify devices across different networks?",
        correctAnswer: "IP addresses (logical addressing)",
        acceptableAnswers: [
          "IP addresses",
          "Logical addresses",
          "IP addressing",
          "Internet Protocol addresses",
          "logical addressing",
          "IPv4/IPv6 addresses",
        ],
        hints: [
          "Unlike MAC addresses which are hardware-based, these addresses are assigned by software and can change.",
          "The most common version uses 32-bit addresses written in dotted-decimal notation (e.g., 192.168.1.1).",
        ],
        explanation:
          "The Network Layer handles logical addressing (IP addresses) and determines the best path for routing packets from source to destination across interconnected networks.",
      },
      {
        type: "free_recall",
        prompt:
          "Explain the role of the Network Layer (Layer 3) in the OSI model. What are its main functions, and what devices and protocols operate at this layer?",
        correctAnswer:
          "The Network Layer is responsible for logical addressing and routing. It assigns logical addresses (IP addresses) to devices so they can be identified across different networks. Its main functions include: (1) Logical Addressing - assigning IP addresses (IPv4 or IPv6) to uniquely identify devices. (2) Routing - determining the best path for packets to travel from source to destination across multiple networks using routing tables and algorithms. (3) Packet Forwarding - moving packets hop-by-hop through intermediate routers. (4) Fragmentation and Reassembly - breaking large packets into smaller fragments when they exceed a link's MTU, and reassembling them at the destination. Routers are the primary Layer 3 devices. Key protocols include IP (IPv4/IPv6), ICMP, OSPF, BGP, and RIP.",
        rubric:
          "A good answer should explain logical addressing (IP), routing/path determination, and mention that routers operate at this layer. Bonus for mentioning fragmentation, specific routing protocols, or the distinction from Layer 2 MAC addressing.",
        keyPoints: [
          "Uses logical (IP) addresses to identify devices across networks",
          "Determines the best path (routing) for packets from source to destination",
          "Routers are the primary Layer 3 devices",
          "Key protocols include IP, ICMP, OSPF, and BGP",
          "Handles packet fragmentation and reassembly across different MTU links",
        ],
        hints: [
          "Think about what happens when data needs to travel beyond the local network segment.",
          "Routers are the key networking device at this layer.",
        ],
        explanation:
          "The Network Layer handles logical addressing (IP addresses) and determines the best path for routing packets from source to destination across interconnected networks.",
      },
    ],
  },
  {
    topicName: "OSI Model",
    concept: "The Application Layer and user-facing protocols",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which OSI layer provides services directly to end-user applications, such as HTTP for web browsing and SMTP for email?",
        choices: [
          "Presentation Layer (Layer 6)",
          "Session Layer (Layer 5)",
          "Transport Layer (Layer 4)",
          "Application Layer (Layer 7)",
        ],
        correctAnswer: "Application Layer (Layer 7)",
        explanation:
          "The Application Layer (Layer 7) is the topmost OSI layer and provides network services directly to end-user applications, including protocols like HTTP, SMTP, FTP, and DNS.",
      },
      {
        type: "cued_recall",
        prompt:
          "Name three protocols that operate at the Application Layer (Layer 7) of the OSI model.",
        correctAnswer: "HTTP, SMTP, and FTP",
        acceptableAnswers: [
          "HTTP, SMTP, FTP",
          "HTTP, DNS, FTP",
          "HTTP, SMTP, DNS",
          "SMTP, FTP, DNS",
          "HTTP, FTP, SSH",
          "HTTP, HTTPS, DNS",
          "HTTP, SMTP, SNMP",
          "DNS, DHCP, HTTP",
          "FTP, SMTP, POP3",
          "HTTP, FTP, Telnet",
        ],
        hints: [
          "Think about the protocols you use every day for web browsing, sending email, or transferring files.",
          "These protocols provide services that applications interact with directly.",
        ],
        explanation:
          "The Application Layer (Layer 7) is the topmost OSI layer and provides network services directly to end-user applications, including protocols like HTTP, SMTP, FTP, and DNS.",
      },
      {
        type: "free_recall",
        prompt:
          "Explain the role of the Application Layer (Layer 7) in the OSI model. What does it do, how does it differ from the layers below it, and what are some common protocols that operate at this layer?",
        correctAnswer:
          "The Application Layer is the topmost layer (Layer 7) of the OSI model. It provides network services directly to end-user applications, serving as the interface between the user's software and the underlying network. Unlike the lower layers which handle data transport, addressing, and signal transmission, the Application Layer is concerned with application-level functionality such as web browsing, email, file transfer, and name resolution. Common protocols include: HTTP/HTTPS (web), SMTP (sending email), POP3/IMAP (receiving email), FTP (file transfer), DNS (domain name resolution), SSH (secure remote access), SNMP (network management), and DHCP (dynamic configuration). The Application Layer does not refer to the applications themselves but rather to the protocols and services that applications use to communicate over the network.",
        rubric:
          "A good answer should explain that Layer 7 provides network services to end-user applications, list several common protocols with their purposes, and distinguish it from lower layers. Bonus for clarifying that it refers to protocols/services rather than the applications themselves.",
        keyPoints: [
          "Topmost layer that provides network services directly to end-user applications",
          "Serves as the interface between user software and the network stack",
          "Common protocols include HTTP, SMTP, FTP, DNS, and SSH",
          "Differs from lower layers which handle transport, routing, and physical transmission",
          "Refers to network protocols and services, not the applications themselves",
        ],
        hints: [
          "Think about what protocols your web browser, email client, and file transfer tools rely on.",
          "This layer is closest to the end user and farthest from the physical wire.",
        ],
        explanation:
          "The Application Layer (Layer 7) is the topmost OSI layer and provides network services directly to end-user applications, including protocols like HTTP, SMTP, FTP, and DNS.",
      },
    ],
  },

  // =======================================================================
  // TCP/IP (6 nodes)
  // =======================================================================
  {
    topicName: "TCP/IP",
    concept: "The TCP three-way handshake",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the correct sequence of the TCP three-way handshake used to establish a connection?",
        choices: [
          "SYN, ACK, FIN",
          "SYN, SYN-ACK, ACK",
          "ACK, SYN, SYN-ACK",
          "FIN, FIN-ACK, ACK",
        ],
        correctAnswer: "SYN, SYN-ACK, ACK",
        explanation:
          "TCP establishes a connection with a three-way handshake: the client sends a SYN, the server responds with a SYN-ACK, and the client completes the handshake with an ACK.",
      },
    ],
  },
  {
    topicName: "TCP/IP",
    concept: "Differences between TCP and UDP",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which characteristic distinguishes UDP from TCP?",
        choices: [
          "UDP guarantees in-order delivery of packets",
          "UDP uses a three-way handshake to establish connections",
          "UDP is connectionless and does not guarantee delivery",
          "UDP provides built-in flow control and congestion management",
        ],
        correctAnswer: "UDP is connectionless and does not guarantee delivery",
        explanation:
          "UDP is a connectionless protocol that sends datagrams without establishing a connection. It does not guarantee delivery, ordering, or duplicate protection, making it faster but less reliable than TCP.",
      },
    ],
  },
  {
    topicName: "TCP/IP",
    concept: "TCP connection termination (four-way teardown)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does a TCP connection normally terminate?",
        choices: [
          "One side sends a RST and the connection closes immediately",
          "Both sides exchange FIN and ACK segments in a four-way handshake",
          "The server sends a single FIN and the client closes",
          "A timeout expires and both sides drop the connection",
        ],
        correctAnswer:
          "Both sides exchange FIN and ACK segments in a four-way handshake",
        explanation:
          "A graceful TCP connection termination uses a four-way handshake: one side sends FIN, the other ACKs, then sends its own FIN, which is ACKed by the first side.",
      },
    ],
  },
  {
    topicName: "TCP/IP",
    concept: "IPv4 address structure and dotted-decimal notation",
    questionTemplates: [
      {
        type: "recognition",
        prompt: "How many bits make up an IPv4 address?",
        choices: ["16 bits", "32 bits", "64 bits", "128 bits"],
        correctAnswer: "32 bits",
        explanation:
          "An IPv4 address is 32 bits long, written as four octets in dotted-decimal notation (e.g., 192.168.1.1). This allows for roughly 4.3 billion unique addresses.",
      },
    ],
  },
  {
    topicName: "TCP/IP",
    concept: "IPv6 address size and notation",
    questionTemplates: [
      {
        type: "recognition",
        prompt: "How many bits make up an IPv6 address?",
        choices: ["32 bits", "64 bits", "128 bits", "256 bits"],
        correctAnswer: "128 bits",
        explanation:
          "An IPv6 address is 128 bits long, written as eight groups of four hexadecimal digits separated by colons (e.g., 2001:0db8::1). This vastly expands the available address space.",
      },
    ],
  },
  {
    topicName: "TCP/IP",
    concept: "Private IP address ranges (RFC 1918)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which of the following is a valid RFC 1918 private IPv4 address range?",
        choices: [
          "8.0.0.0/8",
          "172.16.0.0/12",
          "100.64.0.0/10",
          "224.0.0.0/4",
        ],
        correctAnswer: "172.16.0.0/12",
        explanation:
          "RFC 1918 defines three private address ranges: 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16. These addresses are not routable on the public internet.",
      },
    ],
  },

  // =======================================================================
  // DNS (5 nodes)
  // =======================================================================
  {
    topicName: "DNS",
    concept: "The primary purpose of DNS",
    questionTemplates: [
      {
        type: "recognition",
        prompt: "What is the primary function of the Domain Name System (DNS)?",
        choices: [
          "Assigning IP addresses to devices dynamically",
          "Translating human-readable domain names into IP addresses",
          "Encrypting data transmitted between two hosts",
          "Routing packets between different networks",
        ],
        correctAnswer:
          "Translating human-readable domain names into IP addresses",
        explanation:
          "DNS resolves human-readable domain names (like example.com) to their corresponding IP addresses, enabling users to reach websites and services without memorizing numeric addresses.",
      },
    ],
  },
  {
    topicName: "DNS",
    concept: "DNS record types: A and AAAA",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What type of DNS record maps a domain name to an IPv4 address?",
        choices: [
          "CNAME record",
          "MX record",
          "A record",
          "PTR record",
        ],
        correctAnswer: "A record",
        explanation:
          "An A (Address) record maps a domain name to a 32-bit IPv4 address. Its IPv6 counterpart is the AAAA record, which maps to a 128-bit IPv6 address.",
      },
    ],
  },
  {
    topicName: "DNS",
    concept: "DNS MX records and email routing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which DNS record type specifies the mail server responsible for accepting email on behalf of a domain?",
        choices: [
          "A record",
          "MX record",
          "TXT record",
          "NS record",
        ],
        correctAnswer: "MX record",
        explanation:
          "MX (Mail Exchange) records specify the mail servers that handle email for a domain, along with priority values that determine the order in which servers are tried.",
      },
    ],
  },
  {
    topicName: "DNS",
    concept: "DNS caching and TTL",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the TTL (Time to Live) value in a DNS record control?",
        choices: [
          "The maximum number of hops a DNS query can traverse",
          "How long a resolver should cache the DNS response before querying again",
          "The encryption lifetime of a DNSSEC signature",
          "The maximum size of a DNS response packet",
        ],
        correctAnswer:
          "How long a resolver should cache the DNS response before querying again",
        explanation:
          "TTL specifies the duration in seconds that a DNS record can be cached by a resolver. Once the TTL expires, the resolver must query an authoritative server for a fresh answer.",
      },
    ],
  },
  {
    topicName: "DNS",
    concept: "DNS poisoning / cache poisoning attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is DNS cache poisoning?",
        choices: [
          "Overloading a DNS server with excessive queries to cause denial of service",
          "Injecting fraudulent DNS records into a resolver's cache to redirect traffic",
          "Encrypting DNS queries so they cannot be read in transit",
          "Deleting DNS zone files from an authoritative name server",
        ],
        correctAnswer:
          "Injecting fraudulent DNS records into a resolver's cache to redirect traffic",
        explanation:
          "DNS cache poisoning is an attack where an adversary inserts forged DNS records into a resolver's cache, causing clients to be directed to malicious IP addresses instead of legitimate ones.",
      },
    ],
  },

  // =======================================================================
  // DHCP (5 nodes)
  // =======================================================================
  {
    topicName: "DHCP",
    concept: "The purpose of DHCP",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of the Dynamic Host Configuration Protocol (DHCP)?",
        choices: [
          "Resolving domain names to IP addresses",
          "Automatically assigning IP addresses and network configuration to devices",
          "Encrypting network traffic between hosts",
          "Routing traffic between different subnets",
        ],
        correctAnswer:
          "Automatically assigning IP addresses and network configuration to devices",
        explanation:
          "DHCP automates network configuration by dynamically assigning IP addresses, subnet masks, default gateways, and DNS server addresses to devices when they join a network.",
      },
    ],
  },
  {
    topicName: "DHCP",
    concept: "The DHCP DORA process",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the correct order of messages in the DHCP lease process (DORA)?",
        choices: [
          "Discover, Offer, Request, Acknowledge",
          "Demand, Open, Reply, Accept",
          "Discover, Open, Receive, Authenticate",
          "Detect, Offer, Respond, Assign",
        ],
        correctAnswer: "Discover, Offer, Request, Acknowledge",
        explanation:
          "DHCP uses a four-step DORA process: the client broadcasts a Discover, the server responds with an Offer, the client sends a Request for the offered address, and the server confirms with an Acknowledge.",
      },
    ],
  },
  {
    topicName: "DHCP",
    concept: "DHCP lease time",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What happens when a DHCP lease expires and is not renewed?",
        choices: [
          "The client keeps the IP address permanently",
          "The IP address is returned to the pool and the client must obtain a new lease",
          "The DHCP server automatically assigns a new address without client interaction",
          "The client switches to IPv6 addressing",
        ],
        correctAnswer:
          "The IP address is returned to the pool and the client must obtain a new lease",
        explanation:
          "When a DHCP lease expires, the assigned IP address is returned to the server's available pool. The client must initiate a new DORA exchange to obtain a fresh address and configuration.",
      },
    ],
  },
  {
    topicName: "DHCP",
    concept: "DHCP starvation attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a DHCP starvation attack?",
        choices: [
          "Flooding the DHCP server with Discover messages using spoofed MAC addresses to exhaust the IP pool",
          "Intercepting DHCP Offer messages and modifying the gateway address",
          "Sending forged DHCP Release messages to disconnect legitimate clients",
          "Disabling the DHCP service by exploiting a buffer overflow",
        ],
        correctAnswer:
          "Flooding the DHCP server with Discover messages using spoofed MAC addresses to exhaust the IP pool",
        explanation:
          "In a DHCP starvation attack, the attacker sends a large number of DHCP Discover messages with spoofed MAC addresses, consuming all available IP addresses so legitimate clients cannot obtain a lease.",
      },
    ],
  },
  {
    topicName: "DHCP",
    concept: "Rogue DHCP servers",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What security risk does a rogue DHCP server pose on a network?",
        choices: [
          "It prevents all DNS resolution on the network",
          "It can assign incorrect network settings, redirecting traffic through an attacker-controlled gateway",
          "It overwrites the firmware on network switches",
          "It encrypts all DHCP traffic, making it unreadable to the legitimate server",
        ],
        correctAnswer:
          "It can assign incorrect network settings, redirecting traffic through an attacker-controlled gateway",
        explanation:
          "A rogue DHCP server can hand out a malicious default gateway or DNS server, enabling man-in-the-middle attacks. DHCP snooping on managed switches is the primary defense against this threat.",
      },
    ],
  },

  // =======================================================================
  // Ports & Protocols (6 nodes)
  // =======================================================================
  {
    topicName: "Ports & Protocols",
    concept: "Well-known port for HTTP",
    questionTemplates: [
      {
        type: "recognition",
        prompt: "Which port does unencrypted HTTP use by default?",
        choices: ["Port 21", "Port 22", "Port 80", "Port 443"],
        correctAnswer: "Port 80",
        explanation:
          "HTTP (Hypertext Transfer Protocol) uses TCP port 80 by default. Its encrypted counterpart, HTTPS, uses port 443.",
      },
    ],
  },
  {
    topicName: "Ports & Protocols",
    concept: "Well-known port for HTTPS",
    questionTemplates: [
      {
        type: "recognition",
        prompt: "Which port does HTTPS use by default?",
        choices: ["Port 22", "Port 80", "Port 443", "Port 8080"],
        correctAnswer: "Port 443",
        explanation:
          "HTTPS (HTTP Secure) uses TCP port 443 by default. It encrypts HTTP traffic using TLS to protect data in transit.",
      },
    ],
  },
  {
    topicName: "Ports & Protocols",
    concept: "Well-known port for SSH",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which port is the default for the Secure Shell (SSH) protocol?",
        choices: ["Port 21", "Port 22", "Port 23", "Port 25"],
        correctAnswer: "Port 22",
        explanation:
          "SSH uses TCP port 22 by default. It provides encrypted remote login and command execution, replacing the insecure Telnet protocol (port 23).",
      },
    ],
  },
  {
    topicName: "Ports & Protocols",
    concept: "Well-known port for DNS",
    questionTemplates: [
      {
        type: "recognition",
        prompt: "Which port does DNS primarily use?",
        choices: ["Port 25", "Port 53", "Port 67", "Port 110"],
        correctAnswer: "Port 53",
        explanation:
          "DNS uses port 53 for both UDP (standard queries) and TCP (zone transfers and large responses). Most everyday DNS lookups are sent over UDP for speed.",
      },
    ],
  },
  {
    topicName: "Ports & Protocols",
    concept: "Ephemeral ports and their range",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the typical range for ephemeral (dynamic) ports used by client applications?",
        choices: [
          "0 - 1023",
          "1024 - 49151",
          "49152 - 65535",
          "1 - 255",
        ],
        correctAnswer: "49152 - 65535",
        explanation:
          "IANA designates ports 49152-65535 as dynamic/ephemeral ports. Operating systems assign these temporarily to client-side connections. Well-known ports are 0-1023, and registered ports are 1024-49151.",
      },
    ],
  },
  {
    topicName: "Ports & Protocols",
    concept: "FTP and its default ports",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which two ports does FTP use by default for control and data transfer?",
        choices: [
          "Port 20 (data) and Port 21 (control)",
          "Port 22 (control) and Port 23 (data)",
          "Port 25 (control) and Port 110 (data)",
          "Port 80 (data) and Port 443 (control)",
        ],
        correctAnswer: "Port 20 (data) and Port 21 (control)",
        explanation:
          "FTP uses TCP port 21 for the control channel (commands) and TCP port 20 for active-mode data transfer. Because FTP transmits credentials in cleartext, SFTP or FTPS should be used instead.",
      },
    ],
  },

  // =======================================================================
  // Subnetting (5 nodes)
  // =======================================================================
  {
    topicName: "Subnetting",
    concept: "Subnet masks and their purpose",
    questionTemplates: [
      {
        type: "recognition",
        prompt: "What is the purpose of a subnet mask?",
        choices: [
          "To encrypt traffic between two subnets",
          "To divide an IP address into network and host portions",
          "To assign dynamic IP addresses to devices",
          "To translate domain names to IP addresses",
        ],
        correctAnswer:
          "To divide an IP address into network and host portions",
        explanation:
          "A subnet mask identifies which bits of an IP address represent the network portion and which represent the host portion. This determines whether two devices are on the same local subnet.",
      },
    ],
  },
  {
    topicName: "Subnetting",
    concept: "CIDR notation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In the notation 192.168.1.0/24, what does the '/24' represent?",
        choices: [
          "There are 24 hosts on the network",
          "The first 24 bits are the network portion of the address",
          "The subnet has 24 available IP addresses",
          "The network uses 24 switches",
        ],
        correctAnswer:
          "The first 24 bits are the network portion of the address",
        explanation:
          "CIDR (Classless Inter-Domain Routing) notation uses a slash followed by the number of bits in the network prefix. /24 means the first 24 bits are the network portion, equivalent to a subnet mask of 255.255.255.0.",
      },
    ],
  },
  {
    topicName: "Subnetting",
    concept: "Calculating the number of usable hosts in a subnet",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How many usable host addresses are available in a /24 subnet?",
        choices: ["24", "254", "256", "255"],
        correctAnswer: "254",
        explanation:
          "A /24 subnet has 8 host bits, giving 2^8 = 256 total addresses. Two are reserved (network address and broadcast address), leaving 254 usable host addresses.",
      },
    ],
  },
  {
    topicName: "Subnetting",
    concept: "The broadcast address in a subnet",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the broadcast address for the subnet 10.0.1.0/24?",
        choices: [
          "10.0.1.0",
          "10.0.1.1",
          "10.0.1.254",
          "10.0.1.255",
        ],
        correctAnswer: "10.0.1.255",
        explanation:
          "The broadcast address is the last address in a subnet, where all host bits are set to 1. For 10.0.1.0/24, the broadcast address is 10.0.1.255. Packets sent to this address are delivered to all hosts on the subnet.",
      },
    ],
  },
  {
    topicName: "Subnetting",
    concept: "Classful IP addressing classes A, B, and C",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which IPv4 address class provides a default subnet mask of 255.255.0.0?",
        choices: ["Class A", "Class B", "Class C", "Class D"],
        correctAnswer: "Class B",
        explanation:
          "Class B addresses (128.0.0.0 - 191.255.255.255) use a default 16-bit network prefix, yielding a subnet mask of 255.255.0.0. Class A uses 255.0.0.0 and Class C uses 255.255.255.0.",
      },
    ],
  },

  // =======================================================================
  // ARP (4 nodes)
  // =======================================================================
  {
    topicName: "ARP",
    concept: "The purpose of ARP",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of the Address Resolution Protocol (ARP)?",
        choices: [
          "Translating domain names to IP addresses",
          "Mapping IP addresses to MAC addresses on a local network",
          "Assigning IP addresses dynamically to new devices",
          "Encrypting traffic between two endpoints",
        ],
        correctAnswer:
          "Mapping IP addresses to MAC addresses on a local network",
        explanation:
          "ARP resolves a known IPv4 address to the corresponding MAC (hardware) address on the local network segment, enabling Layer 2 frame delivery to the correct network interface.",
      },
    ],
  },
  {
    topicName: "ARP",
    concept: "How ARP requests and replies work",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does a host discover the MAC address of another device on the same local network using ARP?",
        choices: [
          "It sends a unicast ARP request directly to the target's IP address",
          "It broadcasts an ARP request to all devices; the target replies with its MAC address",
          "It queries the DNS server for the MAC address",
          "It checks a centralized DHCP table for the mapping",
        ],
        correctAnswer:
          "It broadcasts an ARP request to all devices; the target replies with its MAC address",
        explanation:
          "ARP works by broadcasting a request (\"Who has IP x.x.x.x? Tell me.\") to all devices on the local segment. The device with the matching IP responds with a unicast reply containing its MAC address.",
      },
    ],
  },
  {
    topicName: "ARP",
    concept: "ARP spoofing / ARP poisoning attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is ARP spoofing (ARP poisoning)?",
        choices: [
          "Flooding the network with excessive ARP requests to cause a denial of service",
          "Sending falsified ARP replies to link the attacker's MAC address with a legitimate IP address",
          "Blocking all ARP traffic on a switch to prevent devices from communicating",
          "Encrypting ARP tables so they cannot be read by unauthorized users",
        ],
        correctAnswer:
          "Sending falsified ARP replies to link the attacker's MAC address with a legitimate IP address",
        explanation:
          "In ARP spoofing, an attacker sends forged ARP replies associating their MAC address with the IP of another host (often the gateway), enabling man-in-the-middle interception of traffic.",
      },
    ],
  },
  {
    topicName: "ARP",
    concept: "The ARP cache and its security implications",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is stored in a device's ARP cache?",
        choices: [
          "A list of DNS records recently resolved by the device",
          "Recent IP-to-MAC address mappings learned from ARP exchanges",
          "The device's DHCP lease history",
          "A log of all packets sent and received by the device",
        ],
        correctAnswer:
          "Recent IP-to-MAC address mappings learned from ARP exchanges",
        explanation:
          "The ARP cache stores recently learned IP-to-MAC address mappings so the device does not need to broadcast an ARP request for every outgoing frame. Entries expire after a configurable timeout.",
      },
    ],
  },

  // =======================================================================
  // NAT & Firewalls (6 nodes)
  // =======================================================================
  {
    topicName: "NAT & Firewalls",
    concept: "The purpose of Network Address Translation (NAT)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of Network Address Translation (NAT)?",
        choices: [
          "Encrypting traffic between internal and external networks",
          "Translating private IP addresses to a public IP address for internet access",
          "Assigning IP addresses to devices on the local network",
          "Resolving domain names to IP addresses",
        ],
        correctAnswer:
          "Translating private IP addresses to a public IP address for internet access",
        explanation:
          "NAT allows multiple devices on a private network to share a single public IP address when accessing the internet, conserving the limited IPv4 address space.",
      },
    ],
  },
  {
    topicName: "NAT & Firewalls",
    concept: "PAT (Port Address Translation) / NAT overload",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does PAT (Port Address Translation) allow many internal hosts to share a single public IP address?",
        choices: [
          "By assigning each host a unique public IP from a pool",
          "By mapping each internal connection to a unique source port on the public IP",
          "By encrypting each host's traffic with a different key",
          "By routing each host's traffic through a separate physical interface",
        ],
        correctAnswer:
          "By mapping each internal connection to a unique source port on the public IP",
        explanation:
          "PAT (also called NAT overload) distinguishes traffic from multiple internal hosts by assigning each outbound connection a unique source port number on the shared public IP address.",
      },
    ],
  },
  {
    topicName: "NAT & Firewalls",
    concept: "Stateful vs. stateless firewalls",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the key difference between a stateful firewall and a stateless firewall?",
        choices: [
          "Stateful firewalls only work at Layer 7; stateless firewalls work at Layer 3",
          "Stateful firewalls track active connections and allow return traffic; stateless firewalls evaluate each packet independently",
          "Stateless firewalls are more secure because they inspect packet payloads",
          "Stateless firewalls maintain a connection table; stateful firewalls do not",
        ],
        correctAnswer:
          "Stateful firewalls track active connections and allow return traffic; stateless firewalls evaluate each packet independently",
        explanation:
          "A stateful firewall maintains a connection state table, allowing it to automatically permit return traffic for established connections. A stateless firewall evaluates each packet against its rules independently with no memory of prior packets.",
      },
    ],
  },
  {
    topicName: "NAT & Firewalls",
    concept: "Firewall rules: allow, deny, and implicit deny",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the 'implicit deny' rule at the end of a firewall ruleset mean?",
        choices: [
          "All traffic is allowed unless a specific deny rule matches",
          "Any traffic that does not match an explicit allow rule is dropped by default",
          "The firewall logs denied traffic but still forwards it",
          "Only DNS traffic is denied by default",
        ],
        correctAnswer:
          "Any traffic that does not match an explicit allow rule is dropped by default",
        explanation:
          "An implicit deny (also called default deny) means that if no explicit rule matches a packet, the firewall drops it. This is a security best practice that ensures only intentionally permitted traffic is allowed through.",
      },
    ],
  },
  {
    topicName: "NAT & Firewalls",
    concept: "DMZ (Demilitarized Zone) in network architecture",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of a DMZ (Demilitarized Zone) in network security?",
        choices: [
          "To provide a VLAN exclusively for management traffic",
          "To host public-facing services in an isolated subnet between the external and internal networks",
          "To store encrypted backups of firewall configurations",
          "To connect two internal LANs without routing",
        ],
        correctAnswer:
          "To host public-facing services in an isolated subnet between the external and internal networks",
        explanation:
          "A DMZ is a network segment that sits between an organization's internal network and the internet. It hosts public-facing services (web servers, mail servers) while limiting direct access to the internal network if a DMZ host is compromised.",
      },
    ],
  },
  {
    topicName: "NAT & Firewalls",
    concept: "Ingress and egress filtering",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is egress filtering on a firewall?",
        choices: [
          "Inspecting and controlling outbound traffic leaving the network",
          "Blocking all inbound traffic from the internet",
          "Scanning internal traffic for malware signatures",
          "Encrypting traffic before it exits the network",
        ],
        correctAnswer:
          "Inspecting and controlling outbound traffic leaving the network",
        explanation:
          "Egress filtering examines outbound traffic leaving a network, helping to prevent data exfiltration, block command-and-control communications, and stop internal hosts from sending spoofed packets.",
      },
    ],
  },

  // =======================================================================
  // Additional cross-topic nodes to reach ~40 total
  // =======================================================================
  {
    topicName: "TCP/IP",
    concept: "ICMP and its role in network diagnostics",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which protocol is used by the 'ping' utility to test connectivity between two hosts?",
        choices: ["TCP", "UDP", "ICMP", "ARP"],
        correctAnswer: "ICMP",
        explanation:
          "ICMP (Internet Control Message Protocol) is used for network diagnostics and error reporting. The 'ping' command sends ICMP Echo Request messages and listens for Echo Reply messages to verify connectivity.",
      },
    ],
  },
  {
    topicName: "Ports & Protocols",
    concept: "Telnet vs. SSH and security implications",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is Telnet considered insecure compared to SSH?",
        choices: [
          "Telnet uses port 23 while SSH uses port 22, and lower ports are less secure",
          "Telnet transmits all data, including credentials, in plaintext",
          "Telnet does not support remote command execution",
          "Telnet only works on IPv4, while SSH supports both IPv4 and IPv6",
        ],
        correctAnswer:
          "Telnet transmits all data, including credentials, in plaintext",
        explanation:
          "Telnet sends all data in cleartext, making it trivial for an attacker to capture credentials and session data with a packet sniffer. SSH encrypts the entire session, providing confidentiality and integrity.",
      },
    ],
  },
  {
    topicName: "DNS",
    concept: "DNSSEC and its purpose",
    questionTemplates: [
      {
        type: "recognition",
        prompt: "What problem does DNSSEC solve?",
        choices: [
          "It encrypts DNS queries to prevent eavesdropping",
          "It authenticates DNS responses using digital signatures to prevent tampering",
          "It compresses DNS records to reduce bandwidth usage",
          "It replaces the need for recursive DNS resolvers",
        ],
        correctAnswer:
          "It authenticates DNS responses using digital signatures to prevent tampering",
        explanation:
          "DNSSEC adds cryptographic signatures to DNS records, allowing resolvers to verify that responses have not been tampered with. It provides authenticity and integrity but does not encrypt DNS traffic.",
      },
    ],
  },
  {
    topicName: "Subnetting",
    concept: "VLSM (Variable Length Subnet Masking)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What advantage does Variable Length Subnet Masking (VLSM) provide?",
        choices: [
          "It allows different subnets within the same network to use different prefix lengths",
          "It automatically assigns subnet masks based on the number of connected devices",
          "It eliminates the need for a default gateway",
          "It encrypts subnet information to prevent reconnaissance",
        ],
        correctAnswer:
          "It allows different subnets within the same network to use different prefix lengths",
        explanation:
          "VLSM allows a network to be divided into subnets of varying sizes by using different prefix lengths. This prevents wasting IP addresses by right-sizing each subnet to the number of hosts it needs.",
      },
    ],
  },
  {
    topicName: "OSI Model",
    concept: "Encapsulation and PDU names at each OSI layer",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the Protocol Data Unit (PDU) called at the Transport Layer of the OSI model?",
        choices: ["Bit", "Frame", "Packet", "Segment"],
        correctAnswer: "Segment",
        explanation:
          "At the Transport Layer, the PDU is called a segment (TCP) or datagram (UDP). At the Network Layer it is a packet, at the Data Link Layer it is a frame, and at the Physical Layer it is a bit.",
      },
    ],
  },
];
