export interface SeedDomain {
  name: string;
  tier: number;
  description: string;
  prerequisites: string[];
  displayOrder: number;
}

export interface SeedTopic {
  name: string;
  complexityWeight: number;
  displayOrder: number;
}

export interface SeedNode {
  topicName: string;
  concept: string;
  questionTemplates: Array<{
    type: "recognition";
    prompt: string;
    choices: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}

// ---------------------------------------------------------------------------
// Domain
// ---------------------------------------------------------------------------

export const domain: SeedDomain = {
  name: "Network Defense",
  tier: 1,
  description:
    "Firewalls, IDS/IPS, network segmentation, VPNs, and traffic analysis",
  prerequisites: [],
  displayOrder: 9,
};

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

export const topics: SeedTopic[] = [
  {
    name: "Firewalls",
    complexityWeight: 1.0,
    displayOrder: 0,
  },
  {
    name: "IDS & IPS",
    complexityWeight: 1.2,
    displayOrder: 1,
  },
  {
    name: "Network Segmentation",
    complexityWeight: 1.1,
    displayOrder: 2,
  },
  {
    name: "VPN Technologies",
    complexityWeight: 1.2,
    displayOrder: 3,
  },
  {
    name: "Traffic Analysis",
    complexityWeight: 1.3,
    displayOrder: 4,
  },
  {
    name: "DNS Security",
    complexityWeight: 1.2,
    displayOrder: 5,
  },
  {
    name: "Wireless Security",
    complexityWeight: 1.3,
    displayOrder: 6,
  },
  {
    name: "Network Monitoring",
    complexityWeight: 1.4,
    displayOrder: 7,
  },
];

// ---------------------------------------------------------------------------
// Nodes
// ---------------------------------------------------------------------------

export const nodes: SeedNode[] = [
  // =======================================================================
  // Firewalls (13 nodes)
  // =======================================================================
  {
    topicName: "Firewalls",
    concept: "Packet-filtering firewalls and how they operate",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does a packet-filtering firewall make access control decisions?",
        choices: [
          "By inspecting the payload content of each packet for malware signatures",
          "By evaluating packet headers against a set of rules based on IP addresses, ports, and protocols",
          "By authenticating users before allowing any traffic through",
          "By decrypting all encrypted traffic and scanning for threats",
        ],
        correctAnswer:
          "By evaluating packet headers against a set of rules based on IP addresses, ports, and protocols",
        explanation:
          "Packet-filtering firewalls operate at Layers 3 and 4 of the OSI model, examining packet headers (source/destination IP, port numbers, and protocol) against an ordered rule set to allow or deny traffic.",
      },
    ],
  },
  {
    topicName: "Firewalls",
    concept: "Stateful inspection firewalls",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What key capability distinguishes a stateful inspection firewall from a simple packet filter?",
        choices: [
          "It can inspect application-layer content such as HTTP headers",
          "It tracks the state of active connections and makes decisions based on connection context",
          "It uses machine learning to identify zero-day threats",
          "It encrypts all traffic passing through it",
        ],
        correctAnswer:
          "It tracks the state of active connections and makes decisions based on connection context",
        explanation:
          "Stateful inspection firewalls maintain a state table of active connections. They can determine whether an incoming packet belongs to an established session, automatically allowing legitimate return traffic without requiring explicit rules for each direction.",
      },
    ],
  },
  {
    topicName: "Firewalls",
    concept: "Next-generation firewalls (NGFW)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which feature is characteristic of a next-generation firewall (NGFW) but NOT a traditional stateful firewall?",
        choices: [
          "Filtering traffic by source and destination IP address",
          "Deep packet inspection with application awareness and integrated IPS",
          "Maintaining a state table of active connections",
          "Blocking traffic based on port numbers",
        ],
        correctAnswer:
          "Deep packet inspection with application awareness and integrated IPS",
        explanation:
          "NGFWs combine traditional stateful inspection with application-level awareness, integrated intrusion prevention, and often threat intelligence feeds. They can identify and control applications regardless of the port or protocol used.",
      },
    ],
  },
  {
    topicName: "Firewalls",
    concept: "Web application firewalls (WAF)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of a Web Application Firewall (WAF)?",
        choices: [
          "To filter all network traffic at the IP layer",
          "To protect web applications by inspecting and filtering HTTP/HTTPS traffic for attacks like SQL injection and XSS",
          "To establish VPN tunnels between branch offices",
          "To monitor DNS queries for malicious domains",
        ],
        correctAnswer:
          "To protect web applications by inspecting and filtering HTTP/HTTPS traffic for attacks like SQL injection and XSS",
        explanation:
          "A WAF operates at Layer 7 and is specifically designed to protect web applications. It inspects HTTP/HTTPS traffic and can detect and block attacks such as SQL injection, cross-site scripting (XSS), and other OWASP Top 10 threats.",
      },
    ],
  },
  {
    topicName: "Firewalls",
    concept: "Firewall rule ordering and processing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is the order of rules in a firewall's access control list (ACL) important?",
        choices: [
          "Rules are processed alphabetically, so naming conventions matter",
          "Rules are evaluated top-down, and the first matching rule is applied to the packet",
          "All rules are evaluated simultaneously and the majority decision wins",
          "The order does not matter because the firewall optimizes rules automatically",
        ],
        correctAnswer:
          "Rules are evaluated top-down, and the first matching rule is applied to the packet",
        explanation:
          "Firewall rules are processed sequentially from top to bottom. The first rule that matches a packet is applied, and no further rules are evaluated. Placing more specific rules before broader ones ensures correct traffic handling.",
      },
    ],
  },
  {
    topicName: "Firewalls",
    concept: "Host-based vs. network-based firewalls",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the key difference between a host-based firewall and a network-based firewall?",
        choices: [
          "Host-based firewalls run on individual devices; network-based firewalls protect entire network segments",
          "Network-based firewalls can only filter inbound traffic; host-based firewalls filter both directions",
          "Host-based firewalls are hardware appliances; network-based firewalls are software only",
          "Network-based firewalls operate at Layer 7; host-based firewalls operate at Layer 2",
        ],
        correctAnswer:
          "Host-based firewalls run on individual devices; network-based firewalls protect entire network segments",
        explanation:
          "A host-based firewall (like Windows Firewall or iptables) runs on an individual endpoint and controls traffic to and from that device. A network-based firewall sits at a network boundary and filters traffic for all devices behind it.",
      },
    ],
  },
  {
    topicName: "Firewalls",
    concept: "Proxy firewalls and application-layer filtering",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does a proxy firewall (application-layer gateway) differ from a packet-filtering firewall?",
        choices: [
          "A proxy firewall only works with UDP traffic",
          "A proxy firewall terminates and re-establishes connections, inspecting application-layer content",
          "A proxy firewall is faster because it skips header inspection",
          "A proxy firewall cannot log traffic details",
        ],
        correctAnswer:
          "A proxy firewall terminates and re-establishes connections, inspecting application-layer content",
        explanation:
          "A proxy firewall acts as an intermediary, terminating the client connection and creating a new connection to the destination. This allows deep inspection of application-layer data, but introduces additional latency compared to packet filtering.",
      },
    ],
  },
  {
    topicName: "Firewalls",
    concept: "Firewall zones and trust levels",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In a zone-based firewall architecture, what determines which traffic policies are applied?",
        choices: [
          "The MAC addresses of the source and destination devices",
          "The zone pair (source zone to destination zone) that the traffic traverses",
          "The physical cable type used to connect to the firewall",
          "The time of day the traffic is generated",
        ],
        correctAnswer:
          "The zone pair (source zone to destination zone) that the traffic traverses",
        explanation:
          "Zone-based firewalls assign interfaces to security zones and apply policies based on zone pairs. Traffic flowing from one zone to another is evaluated against the policy defined for that specific zone pair, allowing granular control over inter-zone communication.",
      },
    ],
  },
  {
    topicName: "Firewalls",
    concept: "Firewall logging and auditing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is firewall logging important for network security?",
        choices: [
          "Logs automatically block repeat offenders without administrator intervention",
          "Logs provide a record of allowed and denied traffic for incident investigation, compliance, and policy tuning",
          "Logs replace the need for intrusion detection systems",
          "Logs encrypt traffic records so attackers cannot read them",
        ],
        correctAnswer:
          "Logs provide a record of allowed and denied traffic for incident investigation, compliance, and policy tuning",
        explanation:
          "Firewall logs record details of traffic that was allowed or denied, including timestamps, source and destination addresses, ports, and actions taken. These logs are essential for forensic investigation, regulatory compliance, and refining firewall rules.",
      },
    ],
  },
  {
    topicName: "Firewalls",
    concept: "Unified Threat Management (UTM) appliances",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a Unified Threat Management (UTM) appliance?",
        choices: [
          "A device that only performs stateless packet filtering",
          "A single appliance that combines firewall, IDS/IPS, antivirus, VPN, and content filtering in one platform",
          "A software-only solution that replaces all physical network security devices",
          "A dedicated appliance for managing SSL/TLS certificates",
        ],
        correctAnswer:
          "A single appliance that combines firewall, IDS/IPS, antivirus, VPN, and content filtering in one platform",
        explanation:
          "UTM appliances consolidate multiple security functions into a single device, simplifying management for small and medium organizations. While convenient, a UTM can become a single point of failure and may have performance limitations under heavy load.",
      },
    ],
  },
  {
    topicName: "Firewalls",
    concept: "Default deny vs. default allow firewall policies",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which firewall policy approach is considered a security best practice?",
        choices: [
          "Default allow: permit all traffic and create rules to block known threats",
          "Default deny: block all traffic and create rules to explicitly allow required traffic",
          "Mixed mode: allow inbound traffic by default and deny outbound traffic by default",
          "Adaptive mode: let the firewall learn which traffic to allow over time without rules",
        ],
        correctAnswer:
          "Default deny: block all traffic and create rules to explicitly allow required traffic",
        explanation:
          "A default deny policy drops all traffic that is not explicitly permitted by a firewall rule. This least-privilege approach ensures that only known, authorized traffic is allowed, reducing the attack surface compared to a default allow stance.",
      },
    ],
  },
  {
    topicName: "Firewalls",
    concept: "Firewall high availability and failover",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of deploying firewalls in a high-availability (HA) pair?",
        choices: [
          "To double the throughput of firewall rule processing",
          "To ensure continuous network protection by having a standby firewall take over if the primary fails",
          "To allow two different firewall policies to run simultaneously",
          "To eliminate the need for firewall logging",
        ],
        correctAnswer:
          "To ensure continuous network protection by having a standby firewall take over if the primary fails",
        explanation:
          "Firewall HA pairs use active/passive or active/active configurations to provide redundancy. If the primary firewall fails, the secondary takes over with synchronized state information, minimizing downtime and maintaining security policy enforcement.",
      },
    ],
  },
  {
    topicName: "Firewalls",
    concept: "Micro-segmentation firewalls in virtualized environments",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does micro-segmentation achieve in a virtualized or cloud environment?",
        choices: [
          "It segments traffic at the individual workload level, applying firewall policies between virtual machines",
          "It divides the physical network into VLANs only",
          "It replaces the need for any perimeter firewall",
          "It encrypts all traffic between data centers automatically",
        ],
        correctAnswer:
          "It segments traffic at the individual workload level, applying firewall policies between virtual machines",
        explanation:
          "Micro-segmentation applies granular security policies at the individual workload or virtual machine level, restricting lateral movement within the data center. This is a key component of zero trust architectures in virtualized and cloud environments.",
      },
    ],
  },

  // =======================================================================
  // IDS & IPS (13 nodes)
  // =======================================================================
  {
    topicName: "IDS & IPS",
    concept: "The difference between IDS and IPS",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the fundamental difference between an Intrusion Detection System (IDS) and an Intrusion Prevention System (IPS)?",
        choices: [
          "An IDS encrypts traffic; an IPS decrypts traffic",
          "An IDS passively monitors and alerts on suspicious traffic; an IPS actively blocks or drops malicious traffic",
          "An IDS works at Layer 2; an IPS works at Layer 7",
          "An IDS is hardware-based; an IPS is software-based",
        ],
        correctAnswer:
          "An IDS passively monitors and alerts on suspicious traffic; an IPS actively blocks or drops malicious traffic",
        explanation:
          "An IDS detects potential intrusions and generates alerts for analysts to review. An IPS sits inline in the traffic path and can automatically drop or block packets identified as malicious, providing active prevention.",
      },
    ],
  },
  {
    topicName: "IDS & IPS",
    concept: "Signature-based detection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does signature-based intrusion detection work?",
        choices: [
          "It compares network traffic against a database of known attack patterns",
          "It builds a baseline of normal traffic and alerts on deviations",
          "It uses machine learning to predict future attacks",
          "It monitors CPU usage on endpoints to detect compromise",
        ],
        correctAnswer:
          "It compares network traffic against a database of known attack patterns",
        explanation:
          "Signature-based detection matches network traffic or system activity against a database of known attack signatures (patterns). It is very effective at detecting known threats but cannot identify novel or zero-day attacks that have no existing signature.",
      },
    ],
  },
  {
    topicName: "IDS & IPS",
    concept: "Anomaly-based detection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a key advantage of anomaly-based intrusion detection over signature-based detection?",
        choices: [
          "It has a lower false positive rate",
          "It can detect previously unknown attacks by identifying deviations from normal behavior",
          "It requires no initial configuration or training",
          "It is faster at processing high volumes of traffic",
        ],
        correctAnswer:
          "It can detect previously unknown attacks by identifying deviations from normal behavior",
        explanation:
          "Anomaly-based detection establishes a baseline of normal network or system behavior and alerts when activity deviates significantly from that baseline. This enables detection of novel attacks, though it typically produces more false positives than signature-based methods.",
      },
    ],
  },
  {
    topicName: "IDS & IPS",
    concept: "Network-based IDS (NIDS) placement",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Where is a network-based IDS (NIDS) sensor typically placed to monitor traffic?",
        choices: [
          "On each individual endpoint as a software agent",
          "Connected to a SPAN port or network TAP to capture copies of network traffic",
          "Between the ISP and the internet backbone router",
          "Inside the database server to monitor queries",
        ],
        correctAnswer:
          "Connected to a SPAN port or network TAP to capture copies of network traffic",
        explanation:
          "A NIDS sensor is connected to a SPAN (mirror) port on a switch or a network TAP to passively receive copies of traffic flowing through the network. This allows it to analyze traffic without being inline and without impacting network performance.",
      },
    ],
  },
  {
    topicName: "IDS & IPS",
    concept: "Host-based IDS (HIDS)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does a host-based intrusion detection system (HIDS) primarily monitor?",
        choices: [
          "All traffic flowing through the network switches",
          "Activities on the individual host, such as file changes, log entries, and system calls",
          "Wireless access point signal strength and channel interference",
          "DNS resolution requests across the entire network",
        ],
        correctAnswer:
          "Activities on the individual host, such as file changes, log entries, and system calls",
        explanation:
          "A HIDS runs on an individual host and monitors local activities including file system changes, log files, registry modifications, and system calls. OSSEC and Tripwire are well-known HIDS solutions.",
      },
    ],
  },
  {
    topicName: "IDS & IPS",
    concept: "False positives and false negatives in IDS",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In the context of intrusion detection, what is a false positive?",
        choices: [
          "A real attack that the IDS successfully detects and alerts on",
          "Legitimate traffic that the IDS incorrectly flags as malicious",
          "A real attack that the IDS fails to detect",
          "An alert that is generated after the attack has already succeeded",
        ],
        correctAnswer:
          "Legitimate traffic that the IDS incorrectly flags as malicious",
        explanation:
          "A false positive occurs when the IDS generates an alert for benign activity, mistakenly identifying it as an attack. Excessive false positives cause alert fatigue, which can lead analysts to overlook genuine threats (true positives).",
      },
    ],
  },
  {
    topicName: "IDS & IPS",
    concept: "Inline vs. passive IPS deployment",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why must an IPS be deployed inline (in the traffic path) to function correctly?",
        choices: [
          "So it can encrypt all traffic before forwarding it",
          "So it can actively drop or block malicious packets before they reach their destination",
          "So it can increase network bandwidth by compressing packets",
          "So it can assign IP addresses to new devices on the network",
        ],
        correctAnswer:
          "So it can actively drop or block malicious packets before they reach their destination",
        explanation:
          "An IPS must sit inline in the traffic path so it can inspect packets and take action (drop, reset, or quarantine) before they reach the target. A passive deployment (like an IDS) can only alert on threats, not prevent them.",
      },
    ],
  },
  {
    topicName: "IDS & IPS",
    concept: "Snort as an open-source IDS/IPS",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is Snort?",
        choices: [
          "A commercial-only firewall platform with no community edition",
          "An open-source network intrusion detection and prevention system that uses signature-based rules",
          "A proprietary endpoint detection and response (EDR) tool",
          "A DNS security service that blocks malicious domains",
        ],
        correctAnswer:
          "An open-source network intrusion detection and prevention system that uses signature-based rules",
        explanation:
          "Snort is one of the most widely used open-source IDS/IPS platforms. It performs real-time traffic analysis and packet logging, using community-maintained and commercial rule sets to detect a wide range of attacks and suspicious activity.",
      },
    ],
  },
  {
    topicName: "IDS & IPS",
    concept: "Suricata and multi-threaded IDS/IPS processing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a key technical advantage of Suricata over traditional single-threaded IDS/IPS solutions?",
        choices: [
          "Suricata can only process encrypted traffic",
          "Suricata supports multi-threaded processing, enabling higher throughput on modern hardware",
          "Suricata does not require any rule sets to operate",
          "Suricata replaces the need for firewalls entirely",
        ],
        correctAnswer:
          "Suricata supports multi-threaded processing, enabling higher throughput on modern hardware",
        explanation:
          "Suricata is an open-source IDS/IPS engine designed with multi-threading support, allowing it to leverage multiple CPU cores for parallel packet processing. This provides significantly higher throughput than single-threaded engines on modern multi-core systems.",
      },
    ],
  },
  {
    topicName: "IDS & IPS",
    concept: "IDS evasion techniques",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which technique is commonly used by attackers to evade network-based intrusion detection?",
        choices: [
          "Sending all traffic over port 80 since IDS ignores HTTP",
          "Fragmenting packets or using protocol-level obfuscation to avoid signature matching",
          "Connecting only during business hours when IDS is disabled",
          "Using longer passwords for authentication",
        ],
        correctAnswer:
          "Fragmenting packets or using protocol-level obfuscation to avoid signature matching",
        explanation:
          "Attackers use techniques such as packet fragmentation, payload encoding, session splicing, and protocol-level obfuscation to split or disguise attack signatures across multiple packets, making it harder for the IDS to match known patterns.",
      },
    ],
  },
  {
    topicName: "IDS & IPS",
    concept: "IDS/IPS rule tuning and management",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is ongoing rule tuning important for an IDS/IPS deployment?",
        choices: [
          "To increase network latency for security purposes",
          "To reduce false positives and ensure new threats are detected while minimizing alert fatigue",
          "To remove the need for firewall rules",
          "To automatically apply patches to vulnerable systems",
        ],
        correctAnswer:
          "To reduce false positives and ensure new threats are detected while minimizing alert fatigue",
        explanation:
          "Regular rule tuning adjusts detection thresholds, disables irrelevant rules, and adds signatures for newly discovered threats. This minimizes false positives (which cause alert fatigue) and false negatives (which miss real attacks), keeping the system effective.",
      },
    ],
  },
  {
    topicName: "IDS & IPS",
    concept: "Protocol analysis in IDS",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is protocol analysis (protocol decoding) in the context of an IDS?",
        choices: [
          "Converting all traffic to a single protocol for simplified inspection",
          "Parsing network protocols to understand their structure and detect protocol violations or misuse",
          "Encrypting protocols to prevent eavesdropping",
          "Assigning priority levels to different protocols for quality of service",
        ],
        correctAnswer:
          "Parsing network protocols to understand their structure and detect protocol violations or misuse",
        explanation:
          "Protocol analysis involves the IDS parsing the structure of network protocols (HTTP, DNS, SMB, etc.) to verify conformance to standards. Deviations or anomalies in protocol behavior may indicate an attack such as buffer overflow or protocol exploitation.",
      },
    ],
  },
  {
    topicName: "IDS & IPS",
    concept: "Reputation-based threat intelligence in IPS",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How do reputation-based threat intelligence feeds enhance IPS effectiveness?",
        choices: [
          "They encrypt all traffic from known malicious sources",
          "They provide regularly updated lists of known malicious IPs, domains, and URLs for automatic blocking",
          "They replace the need for signature-based detection entirely",
          "They increase the bandwidth available for legitimate traffic",
        ],
        correctAnswer:
          "They provide regularly updated lists of known malicious IPs, domains, and URLs for automatic blocking",
        explanation:
          "Threat intelligence feeds supply continuously updated information about known malicious indicators (IP addresses, domains, file hashes). An IPS can use these feeds to automatically block connections to or from known bad actors, complementing signature and anomaly detection.",
      },
    ],
  },

  // =======================================================================
  // Network Segmentation (13 nodes)
  // =======================================================================
  {
    topicName: "Network Segmentation",
    concept: "The purpose of network segmentation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary security benefit of network segmentation?",
        choices: [
          "It increases internet bandwidth for all segments",
          "It limits lateral movement by isolating network zones, reducing the blast radius of a breach",
          "It eliminates the need for firewalls between segments",
          "It automatically encrypts all inter-segment traffic",
        ],
        correctAnswer:
          "It limits lateral movement by isolating network zones, reducing the blast radius of a breach",
        explanation:
          "Network segmentation divides a network into smaller, isolated zones. If an attacker compromises one segment, segmentation limits their ability to move laterally to other parts of the network, containing the damage and protecting critical assets.",
      },
    ],
  },
  {
    topicName: "Network Segmentation",
    concept: "VLANs and their role in segmentation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How do VLANs (Virtual Local Area Networks) contribute to network segmentation?",
        choices: [
          "VLANs encrypt traffic between network segments",
          "VLANs logically separate broadcast domains on the same physical switch infrastructure",
          "VLANs replace the need for IP addressing within a network",
          "VLANs provide wireless access to segmented networks",
        ],
        correctAnswer:
          "VLANs logically separate broadcast domains on the same physical switch infrastructure",
        explanation:
          "VLANs create separate broadcast domains within the same physical switch, logically isolating groups of devices. Traffic between VLANs must pass through a router or Layer 3 switch, where access control policies can be enforced.",
      },
    ],
  },
  {
    topicName: "Network Segmentation",
    concept: "VLAN hopping attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is VLAN hopping?",
        choices: [
          "An attack where an attacker gains access to traffic on other VLANs by exploiting trunk port configurations",
          "A legitimate method for routing traffic between VLANs using a Layer 3 switch",
          "A technique for increasing VLAN throughput by bonding multiple ports",
          "A protocol for dynamically assigning devices to VLANs",
        ],
        correctAnswer:
          "An attack where an attacker gains access to traffic on other VLANs by exploiting trunk port configurations",
        explanation:
          "VLAN hopping exploits misconfigured trunk ports or uses switch spoofing / double tagging to send traffic to VLANs the attacker should not have access to. Mitigations include disabling unused ports, setting access ports explicitly, and disabling DTP (Dynamic Trunking Protocol).",
      },
    ],
  },
  {
    topicName: "Network Segmentation",
    concept: "DMZ architecture for public-facing services",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why are public-facing servers typically placed in a DMZ rather than on the internal network?",
        choices: [
          "DMZ servers have faster internet connections than internal servers",
          "The DMZ isolates public-facing services so that a compromise does not grant direct access to internal resources",
          "DMZ servers do not require any firewall rules",
          "Placing servers in the DMZ eliminates the need for patching",
        ],
        correctAnswer:
          "The DMZ isolates public-facing services so that a compromise does not grant direct access to internal resources",
        explanation:
          "A DMZ provides a buffer zone between the untrusted internet and the trusted internal network. If a public-facing server in the DMZ is compromised, the attacker is still separated from internal systems by an additional firewall, limiting the impact.",
      },
    ],
  },
  {
    topicName: "Network Segmentation",
    concept: "Zero trust network architecture principles",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the core principle of a zero trust network architecture?",
        choices: [
          "Trust all traffic that originates from inside the corporate network",
          "Never trust, always verify: authenticate and authorize every access request regardless of network location",
          "Replace all firewalls with intrusion detection systems",
          "Allow unrestricted access between network segments after initial authentication",
        ],
        correctAnswer:
          "Never trust, always verify: authenticate and authorize every access request regardless of network location",
        explanation:
          "Zero trust assumes no implicit trust based on network location. Every user, device, and connection must be continuously authenticated, authorized, and validated before being granted access to resources, whether inside or outside the network perimeter.",
      },
    ],
  },
  {
    topicName: "Network Segmentation",
    concept: "Network Access Control (NAC)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary function of Network Access Control (NAC)?",
        choices: [
          "Encrypting all network traffic at the physical layer",
          "Enforcing security policy compliance before granting devices access to the network",
          "Routing traffic between VLANs automatically",
          "Providing DNS resolution for internal hosts",
        ],
        correctAnswer:
          "Enforcing security policy compliance before granting devices access to the network",
        explanation:
          "NAC evaluates devices attempting to connect to the network, checking factors like antivirus status, OS patch level, and authentication credentials. Non-compliant devices can be denied access, placed in a quarantine VLAN, or given limited connectivity until remediated.",
      },
    ],
  },
  {
    topicName: "Network Segmentation",
    concept: "Air-gapped networks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is an air-gapped network?",
        choices: [
          "A network that uses wireless bridges instead of physical cables",
          "A network physically isolated from the internet and other unsecured networks with no direct connectivity",
          "A network that uses VPNs to connect all remote sites",
          "A network with redundant firewalls for high availability",
        ],
        correctAnswer:
          "A network physically isolated from the internet and other unsecured networks with no direct connectivity",
        explanation:
          "An air-gapped network has no physical or logical connection to external networks, including the internet. This extreme form of segmentation is used for highly sensitive systems such as classified military networks, SCADA/ICS systems, and critical infrastructure.",
      },
    ],
  },
  {
    topicName: "Network Segmentation",
    concept: "802.1X port-based authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does IEEE 802.1X provide in network security?",
        choices: [
          "Wireless encryption using WPA3 protocols",
          "Port-based network access control that requires authentication before a device can communicate on the LAN",
          "Automatic IP address assignment using DHCP",
          "Layer 3 routing between VLANs",
        ],
        correctAnswer:
          "Port-based network access control that requires authentication before a device can communicate on the LAN",
        explanation:
          "IEEE 802.1X is a port-based network access control standard. It prevents devices from accessing the network through a switch port until they successfully authenticate via a RADIUS server. The switch port remains unauthorized until the supplicant (client) provides valid credentials.",
      },
    ],
  },
  {
    topicName: "Network Segmentation",
    concept: "Private VLANs (PVLANs)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What additional isolation do Private VLANs (PVLANs) provide beyond standard VLANs?",
        choices: [
          "PVLANs encrypt traffic between ports on the same VLAN",
          "PVLANs restrict communication between hosts within the same VLAN, allowing isolation at the port level",
          "PVLANs automatically assign different IP subnets to each port",
          "PVLANs eliminate the need for a default gateway",
        ],
        correctAnswer:
          "PVLANs restrict communication between hosts within the same VLAN, allowing isolation at the port level",
        explanation:
          "Private VLANs subdivide a standard VLAN into isolated and community ports. Isolated ports cannot communicate with each other, only with promiscuous (uplink) ports. This is commonly used in hosting environments to prevent co-tenants from accessing each other's traffic.",
      },
    ],
  },
  {
    topicName: "Network Segmentation",
    concept: "East-west vs. north-south traffic",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In data center terminology, what does 'east-west traffic' refer to?",
        choices: [
          "Traffic flowing between the data center and the internet",
          "Traffic flowing laterally between servers or workloads within the data center",
          "Traffic between the data center and remote branch offices",
          "Traffic between the primary and disaster recovery sites",
        ],
        correctAnswer:
          "Traffic flowing laterally between servers or workloads within the data center",
        explanation:
          "East-west traffic refers to lateral communication between servers, virtual machines, or containers within the data center. North-south traffic flows between the data center and external networks. Modern segmentation strategies focus heavily on controlling east-west traffic to prevent lateral movement.",
      },
    ],
  },
  {
    topicName: "Network Segmentation",
    concept: "Software-defined networking (SDN) for segmentation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does software-defined networking (SDN) improve network segmentation?",
        choices: [
          "SDN replaces all physical switches with virtual switches",
          "SDN centralizes control plane management, enabling dynamic and programmable segmentation policies",
          "SDN eliminates the need for VLANs entirely",
          "SDN provides hardware-level encryption for all network segments",
        ],
        correctAnswer:
          "SDN centralizes control plane management, enabling dynamic and programmable segmentation policies",
        explanation:
          "SDN separates the control plane from the data plane, allowing administrators to define and modify segmentation policies centrally through software. This enables rapid, automated policy changes across the network without manual switch-by-switch configuration.",
      },
    ],
  },
  {
    topicName: "Network Segmentation",
    concept: "Segmentation for PCI DSS compliance",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is network segmentation important for PCI DSS compliance?",
        choices: [
          "PCI DSS requires all network traffic to be encrypted with TLS 1.3",
          "Segmentation reduces the scope of the cardholder data environment (CDE), simplifying compliance requirements",
          "Segmentation is optional under PCI DSS and provides no compliance benefit",
          "PCI DSS requires air-gapped networks for all payment systems",
        ],
        correctAnswer:
          "Segmentation reduces the scope of the cardholder data environment (CDE), simplifying compliance requirements",
        explanation:
          "While not strictly required by PCI DSS, network segmentation isolates systems that store, process, or transmit cardholder data. This reduces the scope of the CDE, meaning fewer systems need to meet PCI DSS requirements, lowering cost and complexity of compliance.",
      },
    ],
  },
  {
    topicName: "Network Segmentation",
    concept: "Lateral movement and segmentation as a defense",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does network segmentation help defend against lateral movement by attackers?",
        choices: [
          "It encrypts credentials so they cannot be stolen during lateral movement",
          "It places barriers between network zones, requiring the attacker to bypass additional access controls to reach other segments",
          "It prevents all traffic between segments, including legitimate traffic",
          "It automatically patches vulnerable systems in each segment",
        ],
        correctAnswer:
          "It places barriers between network zones, requiring the attacker to bypass additional access controls to reach other segments",
        explanation:
          "After initial compromise, attackers attempt lateral movement to access additional systems and data. Segmentation creates boundaries with enforced access controls, so the attacker must find ways to bypass additional firewalls, ACLs, or authentication mechanisms to pivot between zones.",
      },
    ],
  },

  // =======================================================================
  // VPN Technologies (13 nodes)
  // =======================================================================
  {
    topicName: "VPN Technologies",
    concept: "What a VPN does and why it is used",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of a Virtual Private Network (VPN)?",
        choices: [
          "To increase internet connection speed by compressing data",
          "To create an encrypted tunnel over an untrusted network, providing secure remote access or site-to-site connectivity",
          "To assign public IP addresses to internal devices",
          "To replace firewalls for network security",
        ],
        correctAnswer:
          "To create an encrypted tunnel over an untrusted network, providing secure remote access or site-to-site connectivity",
        explanation:
          "A VPN creates an encrypted tunnel over a public or untrusted network (such as the internet), allowing remote users or branch offices to securely access private network resources as if they were directly connected to the internal network.",
      },
    ],
  },
  {
    topicName: "VPN Technologies",
    concept: "IPsec VPN and its core protocols",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which two core protocols does IPsec use to secure network communications?",
        choices: [
          "HTTP and HTTPS",
          "AH (Authentication Header) and ESP (Encapsulating Security Payload)",
          "TCP and UDP",
          "SSL and TLS",
        ],
        correctAnswer:
          "AH (Authentication Header) and ESP (Encapsulating Security Payload)",
        explanation:
          "IPsec uses AH for authentication and integrity (without encryption) and ESP for authentication, integrity, and confidentiality (encryption). ESP is more commonly used because it provides encryption in addition to authentication.",
      },
    ],
  },
  {
    topicName: "VPN Technologies",
    concept: "IPsec tunnel mode vs. transport mode",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the difference between IPsec tunnel mode and transport mode?",
        choices: [
          "Tunnel mode encrypts only the payload; transport mode encrypts the entire packet including the original IP header",
          "Tunnel mode encapsulates and encrypts the entire original IP packet with a new header; transport mode encrypts only the payload",
          "There is no difference; both modes encrypt traffic identically",
          "Transport mode is used for site-to-site VPNs; tunnel mode is used for remote access",
        ],
        correctAnswer:
          "Tunnel mode encapsulates and encrypts the entire original IP packet with a new header; transport mode encrypts only the payload",
        explanation:
          "In tunnel mode, the entire original IP packet is encrypted and encapsulated within a new IP packet with new headers, commonly used for site-to-site VPNs. Transport mode encrypts only the payload, leaving the original IP header intact, typically used for host-to-host communication.",
      },
    ],
  },
  {
    topicName: "VPN Technologies",
    concept: "SSL/TLS VPN",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a key advantage of an SSL/TLS VPN over a traditional IPsec VPN for remote access?",
        choices: [
          "SSL/TLS VPNs provide stronger encryption than IPsec",
          "SSL/TLS VPNs can work through most firewalls and NAT devices using standard HTTPS port 443, requiring no special client software",
          "SSL/TLS VPNs do not require any encryption",
          "SSL/TLS VPNs are faster because they do not encrypt traffic",
        ],
        correctAnswer:
          "SSL/TLS VPNs can work through most firewalls and NAT devices using standard HTTPS port 443, requiring no special client software",
        explanation:
          "SSL/TLS VPNs operate over HTTPS (port 443), which is almost universally allowed through firewalls and NAT devices. Many can be accessed through a web browser without installing a dedicated VPN client, making them convenient for remote access scenarios.",
      },
    ],
  },
  {
    topicName: "VPN Technologies",
    concept: "Split tunneling vs. full tunneling",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is split tunneling in a VPN configuration?",
        choices: [
          "Routing all traffic through the VPN tunnel, including internet-bound traffic",
          "Routing only corporate-destined traffic through the VPN tunnel while allowing internet traffic to go directly to the internet",
          "Using two separate VPN tunnels for redundancy",
          "Splitting the encryption key between the client and server",
        ],
        correctAnswer:
          "Routing only corporate-destined traffic through the VPN tunnel while allowing internet traffic to go directly to the internet",
        explanation:
          "Split tunneling routes only traffic destined for corporate resources through the VPN tunnel, while internet-bound traffic goes directly out the user's local internet connection. This reduces VPN bandwidth usage but creates a potential security risk since internet traffic bypasses corporate security controls.",
      },
    ],
  },
  {
    topicName: "VPN Technologies",
    concept: "WireGuard VPN protocol",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a distinguishing characteristic of the WireGuard VPN protocol?",
        choices: [
          "It uses the SSL/TLS handshake for key exchange",
          "It has a minimal codebase with modern cryptographic primitives, emphasizing simplicity and performance",
          "It requires a dedicated hardware appliance to operate",
          "It supports only site-to-site VPN configurations",
        ],
        correctAnswer:
          "It has a minimal codebase with modern cryptographic primitives, emphasizing simplicity and performance",
        explanation:
          "WireGuard is a modern VPN protocol with approximately 4,000 lines of code (compared to hundreds of thousands for OpenVPN or IPsec). It uses state-of-the-art cryptographic primitives (Curve25519, ChaCha20, Poly1305) and is designed for high performance and easy auditability.",
      },
    ],
  },
  {
    topicName: "VPN Technologies",
    concept: "Site-to-site VPN",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a site-to-site VPN used for?",
        choices: [
          "Connecting individual remote users to the corporate network",
          "Creating a persistent encrypted tunnel between two network locations, such as headquarters and a branch office",
          "Providing anonymous internet browsing for employees",
          "Replacing wireless access points in branch offices",
        ],
        correctAnswer:
          "Creating a persistent encrypted tunnel between two network locations, such as headquarters and a branch office",
        explanation:
          "A site-to-site VPN connects two or more networks (such as a headquarters and branch office) over the internet using a persistent encrypted tunnel. All traffic between the sites flows through the tunnel, making the remote network appear as a local extension.",
      },
    ],
  },
  {
    topicName: "VPN Technologies",
    concept: "IKE (Internet Key Exchange) in IPsec",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the role of IKE (Internet Key Exchange) in IPsec VPNs?",
        choices: [
          "IKE handles the routing of encrypted packets between VPN endpoints",
          "IKE negotiates security associations and manages the exchange of cryptographic keys between VPN peers",
          "IKE compresses data before encryption to improve throughput",
          "IKE monitors VPN tunnel health and performs failover",
        ],
        correctAnswer:
          "IKE negotiates security associations and manages the exchange of cryptographic keys between VPN peers",
        explanation:
          "IKE is the protocol used to set up security associations (SAs) in IPsec. It authenticates the VPN peers, negotiates encryption algorithms, and securely exchanges the cryptographic keys needed to encrypt and decrypt the tunnel traffic.",
      },
    ],
  },
  {
    topicName: "VPN Technologies",
    concept: "VPN concentrators",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the function of a VPN concentrator?",
        choices: [
          "To block all VPN traffic at the network perimeter",
          "To handle a large number of simultaneous VPN connections, managing tunnel creation, encryption, and authentication centrally",
          "To convert VPN traffic into unencrypted traffic for internal use",
          "To provide DNS resolution for VPN clients",
        ],
        correctAnswer:
          "To handle a large number of simultaneous VPN connections, managing tunnel creation, encryption, and authentication centrally",
        explanation:
          "A VPN concentrator is a dedicated device (or software) designed to terminate and manage many simultaneous VPN tunnels. It handles the CPU-intensive tasks of encryption/decryption, authenticates remote users, and assigns network parameters to connected clients.",
      },
    ],
  },
  {
    topicName: "VPN Technologies",
    concept: "Always-on VPN for endpoint security",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is an always-on VPN and why is it used?",
        choices: [
          "A VPN that only activates when accessing specific applications",
          "A VPN connection that is automatically established whenever the device has network connectivity, ensuring all traffic is always protected",
          "A VPN that uses permanent static IP addresses for all clients",
          "A VPN that does not require any authentication",
        ],
        correctAnswer:
          "A VPN connection that is automatically established whenever the device has network connectivity, ensuring all traffic is always protected",
        explanation:
          "Always-on VPN automatically establishes a VPN connection whenever the device connects to any network, without user intervention. This ensures that all traffic is always routed through corporate security controls, preventing data leaks on untrusted networks.",
      },
    ],
  },
  {
    topicName: "VPN Technologies",
    concept: "OpenVPN and its protocol characteristics",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which protocol and port does OpenVPN commonly use by default?",
        choices: [
          "TCP port 22",
          "UDP port 1194",
          "TCP port 443 exclusively",
          "UDP port 500",
        ],
        correctAnswer: "UDP port 1194",
        explanation:
          "OpenVPN uses UDP port 1194 by default, though it can be configured to use TCP on any port (including 443 to traverse restrictive firewalls). It uses the OpenSSL library for encryption and supports a wide range of cryptographic algorithms.",
      },
    ],
  },
  {
    topicName: "VPN Technologies",
    concept: "VPN authentication methods",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which VPN authentication method provides the strongest security?",
        choices: [
          "Pre-shared key (PSK) with a short passphrase",
          "Username and password only",
          "Certificate-based authentication combined with multi-factor authentication (MFA)",
          "MAC address filtering",
        ],
        correctAnswer:
          "Certificate-based authentication combined with multi-factor authentication (MFA)",
        explanation:
          "Certificate-based authentication uses digital certificates (PKI) to verify VPN peer identity, which is more secure than pre-shared keys or passwords. Combining certificates with MFA (such as a hardware token or authenticator app) provides defense in depth against credential compromise.",
      },
    ],
  },
  {
    topicName: "VPN Technologies",
    concept: "VPN kill switch functionality",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does a VPN kill switch do?",
        choices: [
          "It terminates the VPN connection after a set time period",
          "It blocks all internet traffic if the VPN connection drops, preventing unencrypted data leaks",
          "It disconnects all other devices from the network when the VPN is active",
          "It shuts down the VPN server if an attack is detected",
        ],
        correctAnswer:
          "It blocks all internet traffic if the VPN connection drops, preventing unencrypted data leaks",
        explanation:
          "A VPN kill switch monitors the VPN connection and automatically blocks all network traffic if the tunnel drops unexpectedly. This prevents sensitive data from being transmitted over an unencrypted connection before the VPN can reconnect.",
      },
    ],
  },

  // =======================================================================
  // Traffic Analysis (13 nodes)
  // =======================================================================
  {
    topicName: "Traffic Analysis",
    concept: "Packet capture and its purpose in network defense",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of packet capture (pcap) in network security?",
        choices: [
          "To increase network speed by compressing packets",
          "To record network traffic for analysis, troubleshooting, and forensic investigation",
          "To encrypt all network traffic automatically",
          "To block malicious packets in real time",
        ],
        correctAnswer:
          "To record network traffic for analysis, troubleshooting, and forensic investigation",
        explanation:
          "Packet capture involves recording raw network packets for later analysis. Security teams use pcap data for incident response, forensic investigation, protocol analysis, and detecting anomalous behavior that other tools may have missed.",
      },
    ],
  },
  {
    topicName: "Traffic Analysis",
    concept: "Wireshark as a packet analysis tool",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is Wireshark primarily used for?",
        choices: [
          "Blocking malicious network traffic in real time",
          "Capturing and interactively analyzing network protocol data",
          "Encrypting network traffic between endpoints",
          "Scanning for open ports on remote hosts",
        ],
        correctAnswer:
          "Capturing and interactively analyzing network protocol data",
        explanation:
          "Wireshark is an open-source network protocol analyzer that captures live traffic or reads saved pcap files. It provides detailed protocol dissection, filtering, and visualization capabilities, making it an essential tool for network troubleshooting and security analysis.",
      },
    ],
  },
  {
    topicName: "Traffic Analysis",
    concept: "tcpdump for command-line packet capture",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is tcpdump?",
        choices: [
          "A graphical network monitoring dashboard",
          "A command-line packet capture and analysis tool commonly used on Unix/Linux systems",
          "A Windows-only network vulnerability scanner",
          "A protocol for transferring files securely",
        ],
        correctAnswer:
          "A command-line packet capture and analysis tool commonly used on Unix/Linux systems",
        explanation:
          "tcpdump is a command-line network packet analyzer available on most Unix/Linux systems. It can capture live traffic, filter by protocol/port/host, and save captures to pcap files for later analysis with tools like Wireshark.",
      },
    ],
  },
  {
    topicName: "Traffic Analysis",
    concept: "NetFlow and flow-based traffic analysis",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does NetFlow (or IPFIX) provide for network traffic analysis?",
        choices: [
          "Full packet capture of all network traffic",
          "Summarized metadata about network conversations including source/destination IPs, ports, protocols, and byte counts",
          "Real-time malware scanning of all packets",
          "Automatic blocking of suspicious traffic flows",
        ],
        correctAnswer:
          "Summarized metadata about network conversations including source/destination IPs, ports, protocols, and byte counts",
        explanation:
          "NetFlow collects metadata about network flows (conversations) rather than full packet payloads. Each flow record includes source and destination IPs, ports, protocol, timestamps, and byte/packet counts. This provides visibility into traffic patterns without the storage overhead of full packet capture.",
      },
    ],
  },
  {
    topicName: "Traffic Analysis",
    concept: "Deep packet inspection (DPI)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What distinguishes deep packet inspection (DPI) from basic packet filtering?",
        choices: [
          "DPI only examines packet headers, while basic filtering examines payloads",
          "DPI examines the data payload of packets in addition to headers, enabling content-level analysis",
          "DPI is faster because it skips header inspection entirely",
          "DPI can only analyze encrypted traffic",
        ],
        correctAnswer:
          "DPI examines the data payload of packets in addition to headers, enabling content-level analysis",
        explanation:
          "Deep packet inspection goes beyond header analysis to examine the actual data payload of packets. This enables identification of applications, detection of malware, enforcement of content policies, and detection of protocol anomalies that header-only inspection would miss.",
      },
    ],
  },
  {
    topicName: "Traffic Analysis",
    concept: "Baseline traffic analysis for anomaly detection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is establishing a network traffic baseline important for security?",
        choices: [
          "It determines the maximum bandwidth the network can handle",
          "It defines normal traffic patterns so that deviations indicating attacks or misconfigurations can be identified",
          "It automatically blocks all traffic that exceeds the baseline",
          "It replaces the need for firewall rules",
        ],
        correctAnswer:
          "It defines normal traffic patterns so that deviations indicating attacks or misconfigurations can be identified",
        explanation:
          "A traffic baseline documents normal network behavior including typical traffic volumes, protocols, peak hours, and communication patterns. Security teams compare current traffic against this baseline to identify anomalies that may indicate compromise, data exfiltration, or misconfiguration.",
      },
    ],
  },
  {
    topicName: "Traffic Analysis",
    concept: "Identifying command and control (C2) traffic",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which traffic pattern may indicate command and control (C2) activity on a network?",
        choices: [
          "High-volume file transfers during scheduled backup windows",
          "Regular, periodic beaconing to an external IP address with small, consistent packet sizes",
          "Increased DNS queries when employees arrive at work",
          "Large downloads from well-known software update servers",
        ],
        correctAnswer:
          "Regular, periodic beaconing to an external IP address with small, consistent packet sizes",
        explanation:
          "C2 traffic often exhibits periodic beaconing patterns where compromised hosts check in with the attacker's server at regular intervals. These connections typically have small, consistent packet sizes and may use unusual ports, DNS tunneling, or HTTPS to blend in with normal traffic.",
      },
    ],
  },
  {
    topicName: "Traffic Analysis",
    concept: "DNS traffic analysis for threat detection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What suspicious indicator in DNS traffic might suggest data exfiltration or tunneling?",
        choices: [
          "DNS queries for well-known domains like google.com",
          "Unusually long subdomain strings or high volumes of TXT record queries to uncommon domains",
          "Standard A record lookups for internal servers",
          "DNS responses with normal TTL values",
        ],
        correctAnswer:
          "Unusually long subdomain strings or high volumes of TXT record queries to uncommon domains",
        explanation:
          "DNS tunneling encodes data in DNS queries and responses, often using very long subdomain labels or TXT records. High query volumes to unusual domains, queries with encoded or random-looking subdomains, and abnormal record types are indicators of DNS-based data exfiltration.",
      },
    ],
  },
  {
    topicName: "Traffic Analysis",
    concept: "Encrypted traffic analysis challenges",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What challenge does widespread TLS encryption pose for network traffic analysis?",
        choices: [
          "TLS makes packets larger, causing network congestion",
          "TLS prevents inspection of payload content, limiting visibility into encrypted communications for threat detection",
          "TLS changes the source IP address of all packets",
          "TLS prevents NetFlow from collecting flow metadata",
        ],
        correctAnswer:
          "TLS prevents inspection of payload content, limiting visibility into encrypted communications for threat detection",
        explanation:
          "TLS encryption prevents security tools from inspecting packet payloads, making it difficult to detect malware, data exfiltration, or policy violations within encrypted traffic. Solutions include TLS inspection proxies, endpoint detection, and analyzing metadata (JA3 fingerprints, certificate details, traffic patterns).",
      },
    ],
  },
  {
    topicName: "Traffic Analysis",
    concept: "JA3 fingerprinting for TLS client identification",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does JA3 fingerprinting identify in network traffic?",
        choices: [
          "The geographic location of a TLS server",
          "The unique TLS client hello parameters to fingerprint the application or malware making the connection",
          "The encryption key used in a TLS session",
          "The certificate authority that issued the server's certificate",
        ],
        correctAnswer:
          "The unique TLS client hello parameters to fingerprint the application or malware making the connection",
        explanation:
          "JA3 creates an MD5 hash from specific fields in the TLS Client Hello message (SSL version, ciphers, extensions, elliptic curves). This fingerprint identifies the client application or library, enabling detection of known malware that uses distinctive TLS implementations.",
      },
    ],
  },
  {
    topicName: "Traffic Analysis",
    concept: "Network TAPs vs. SPAN ports for traffic capture",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What advantage does a network TAP have over a SPAN (mirror) port for traffic capture?",
        choices: [
          "TAPs are cheaper than SPAN ports",
          "TAPs provide a complete, unaltered copy of traffic without impacting switch performance or dropping packets under load",
          "TAPs encrypt captured traffic automatically",
          "TAPs can filter traffic before capturing, reducing storage requirements",
        ],
        correctAnswer:
          "TAPs provide a complete, unaltered copy of traffic without impacting switch performance or dropping packets under load",
        explanation:
          "Network TAPs are dedicated hardware devices that passively copy traffic from a network link. Unlike SPAN ports, TAPs do not consume switch CPU resources, do not drop packets under high load, and provide a bit-for-bit copy of all traffic including physical layer errors.",
      },
    ],
  },
  {
    topicName: "Traffic Analysis",
    concept: "Zeek (Bro) for network security monitoring",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is Zeek (formerly Bro) primarily used for in network security?",
        choices: [
          "Blocking malicious traffic inline like a firewall",
          "Generating detailed logs and metadata about network activity for security monitoring and analysis",
          "Encrypting network traffic between endpoints",
          "Scanning hosts for known vulnerabilities",
        ],
        correctAnswer:
          "Generating detailed logs and metadata about network activity for security monitoring and analysis",
        explanation:
          "Zeek is a powerful open-source network security monitoring framework that passively analyzes network traffic and generates detailed, structured logs about connections, HTTP sessions, DNS queries, file transfers, and more. These logs are widely used for threat hunting and incident response.",
      },
    ],
  },
  {
    topicName: "Traffic Analysis",
    concept: "Bandwidth monitoring and traffic shaping",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the security relevance of bandwidth monitoring on a network?",
        choices: [
          "It ensures all users have equal internet speed",
          "Unexpected spikes in bandwidth usage may indicate data exfiltration, malware propagation, or unauthorized activity",
          "It eliminates the need for intrusion detection systems",
          "It automatically throttles all encrypted traffic",
        ],
        correctAnswer:
          "Unexpected spikes in bandwidth usage may indicate data exfiltration, malware propagation, or unauthorized activity",
        explanation:
          "Monitoring bandwidth usage helps identify anomalous activity such as large data exfiltration attempts, worm propagation, DDoS attacks, or unauthorized services. Sudden or unusual changes in traffic volume patterns can be early indicators of a security incident.",
      },
    ],
  },

  // =======================================================================
  // DNS Security (12 nodes)
  // =======================================================================
  {
    topicName: "DNS Security",
    concept: "DNS as an attack vector",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is DNS frequently targeted by attackers?",
        choices: [
          "DNS traffic is always encrypted, making attacks undetectable",
          "DNS is a foundational service that is often trusted and allowed through firewalls, making it useful for tunneling and exfiltration",
          "DNS servers store user passwords and authentication tokens",
          "DNS only runs on easily compromised legacy systems",
        ],
        correctAnswer:
          "DNS is a foundational service that is often trusted and allowed through firewalls, making it useful for tunneling and exfiltration",
        explanation:
          "DNS is critical for network functionality and its traffic (port 53) is almost universally allowed through firewalls. Attackers exploit this trust to tunnel data through DNS queries, exfiltrate information, redirect users to malicious sites, and communicate with command and control infrastructure.",
      },
    ],
  },
  {
    topicName: "DNS Security",
    concept: "DNSSEC for response authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does DNSSEC protect against?",
        choices: [
          "Eavesdropping on DNS queries in transit",
          "DNS response spoofing and cache poisoning by cryptographically signing DNS records",
          "DDoS attacks targeting DNS servers",
          "Unauthorized zone transfers between DNS servers",
        ],
        correctAnswer:
          "DNS response spoofing and cache poisoning by cryptographically signing DNS records",
        explanation:
          "DNSSEC adds digital signatures to DNS records, allowing resolvers to verify that responses are authentic and have not been tampered with. This prevents cache poisoning and response spoofing attacks. Note that DNSSEC provides integrity and authenticity but does not encrypt DNS traffic.",
      },
    ],
  },
  {
    topicName: "DNS Security",
    concept: "DNS over HTTPS (DoH)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary benefit of DNS over HTTPS (DoH)?",
        choices: [
          "It speeds up DNS resolution by caching results locally",
          "It encrypts DNS queries within HTTPS traffic, preventing eavesdropping and manipulation of DNS lookups",
          "It eliminates the need for DNSSEC",
          "It allows DNS servers to block malicious websites automatically",
        ],
        correctAnswer:
          "It encrypts DNS queries within HTTPS traffic, preventing eavesdropping and manipulation of DNS lookups",
        explanation:
          "DNS over HTTPS (DoH) encrypts DNS queries and responses within standard HTTPS connections (port 443). This prevents ISPs, network operators, and attackers on the path from seeing or modifying DNS lookups, enhancing user privacy. However, it can also bypass enterprise DNS security controls.",
      },
    ],
  },
  {
    topicName: "DNS Security",
    concept: "DNS over TLS (DoT)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does DNS over TLS (DoT) differ from DNS over HTTPS (DoH)?",
        choices: [
          "DoT does not encrypt DNS traffic",
          "DoT uses a dedicated port (853) for encrypted DNS, while DoH wraps DNS in HTTPS on port 443",
          "DoT is faster because it does not use encryption",
          "DoT can only be used on internal networks",
        ],
        correctAnswer:
          "DoT uses a dedicated port (853) for encrypted DNS, while DoH wraps DNS in HTTPS on port 443",
        explanation:
          "DoT encrypts DNS using TLS on dedicated port 853, making it easy for network administrators to identify and manage encrypted DNS traffic. DoH uses port 443, blending in with regular HTTPS traffic, which provides more privacy but makes enterprise monitoring more difficult.",
      },
    ],
  },
  {
    topicName: "DNS Security",
    concept: "DNS sinkholing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is DNS sinkholing?",
        choices: [
          "Deleting DNS records to take a domain offline",
          "Redirecting DNS queries for known malicious domains to a controlled IP address to prevent access and enable monitoring",
          "Flooding a DNS server with queries to cause denial of service",
          "Transferring DNS zone files to an unauthorized server",
        ],
        correctAnswer:
          "Redirecting DNS queries for known malicious domains to a controlled IP address to prevent access and enable monitoring",
        explanation:
          "DNS sinkholing intercepts DNS queries for known malicious domains and returns a controlled IP address instead of the real one. This prevents compromised systems from communicating with C2 servers and allows security teams to identify infected hosts by monitoring connections to the sinkhole.",
      },
    ],
  },
  {
    topicName: "DNS Security",
    concept: "DNS tunneling attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does DNS tunneling work as a data exfiltration technique?",
        choices: [
          "By exploiting buffer overflows in DNS server software",
          "By encoding data within DNS query names and response records to bypass firewalls and exfiltrate information",
          "By redirecting DNS traffic to use TCP instead of UDP",
          "By creating fake DNS root servers",
        ],
        correctAnswer:
          "By encoding data within DNS query names and response records to bypass firewalls and exfiltrate information",
        explanation:
          "DNS tunneling encodes data into DNS queries (typically as subdomain labels) and responses (often using TXT or NULL records). Since DNS traffic is usually allowed through firewalls, attackers can use this covert channel to exfiltrate data or establish C2 communications.",
      },
    ],
  },
  {
    topicName: "DNS Security",
    concept: "Response Policy Zones (RPZ) for DNS filtering",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What are Response Policy Zones (RPZ) used for in DNS security?",
        choices: [
          "Encrypting DNS responses to prevent interception",
          "Defining policies that override DNS responses for specific domains, enabling blocking of malicious or unwanted domains",
          "Balancing load across multiple DNS servers",
          "Automatically updating DNSSEC signatures",
        ],
        correctAnswer:
          "Defining policies that override DNS responses for specific domains, enabling blocking of malicious or unwanted domains",
        explanation:
          "RPZ allows DNS administrators to define custom policies that modify DNS responses for specific domains. This enables blocking access to known malicious domains, phishing sites, or policy-violating content by returning NXDOMAIN, a sinkhole address, or other controlled responses.",
      },
    ],
  },
  {
    topicName: "DNS Security",
    concept: "DNS amplification DDoS attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does a DNS amplification DDoS attack work?",
        choices: [
          "By poisoning DNS caches to redirect traffic to the victim",
          "By sending small DNS queries with a spoofed source IP (the victim's), causing large responses to flood the victim",
          "By exhausting the DNS server's connection pool with incomplete TCP handshakes",
          "By deleting DNS records so the victim's domain becomes unreachable",
        ],
        correctAnswer:
          "By sending small DNS queries with a spoofed source IP (the victim's), causing large responses to flood the victim",
        explanation:
          "In a DNS amplification attack, the attacker sends DNS queries to open resolvers with the source IP spoofed to the victim's address. The DNS responses (which can be much larger than the queries) are sent to the victim, overwhelming their bandwidth. Amplification factors of 50x or more are possible.",
      },
    ],
  },
  {
    topicName: "DNS Security",
    concept: "Protective DNS services",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What do protective DNS services (such as Quad9 or Cloudflare Gateway) provide?",
        choices: [
          "Free domain registration for organizations",
          "DNS resolution that blocks queries to known malicious domains, providing a first layer of defense",
          "Automatic DNSSEC signing for all domains",
          "VPN tunneling through DNS for anonymous browsing",
        ],
        correctAnswer:
          "DNS resolution that blocks queries to known malicious domains, providing a first layer of defense",
        explanation:
          "Protective DNS services maintain threat intelligence feeds and block DNS resolution for known malicious, phishing, or malware-hosting domains. By pointing resolvers to these services, organizations gain an additional security layer that can prevent users from reaching harmful destinations.",
      },
    ],
  },
  {
    topicName: "DNS Security",
    concept: "DNS zone transfer security",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why should DNS zone transfers (AXFR) be restricted?",
        choices: [
          "Zone transfers consume too much bandwidth for regular use",
          "Unrestricted zone transfers expose all DNS records in a zone, giving attackers a complete map of the organization's hosts and services",
          "Zone transfers automatically delete records from the primary server",
          "Zone transfers encrypt records, making them unreadable",
        ],
        correctAnswer:
          "Unrestricted zone transfers expose all DNS records in a zone, giving attackers a complete map of the organization's hosts and services",
        explanation:
          "A DNS zone transfer (AXFR) copies all records from a DNS zone. If unrestricted, attackers can enumerate all hostnames, IP addresses, and service records, providing valuable reconnaissance information. Zone transfers should be restricted to authorized secondary DNS servers only.",
      },
    ],
  },
  {
    topicName: "DNS Security",
    concept: "Domain generation algorithms (DGA) in malware",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What are domain generation algorithms (DGAs) used for in malware?",
        choices: [
          "To generate legitimate SSL certificates for phishing sites",
          "To algorithmically generate large numbers of pseudo-random domain names for C2 communication, making blocking difficult",
          "To speed up DNS resolution for the malware's network traffic",
          "To encrypt DNS queries so they cannot be inspected",
        ],
        correctAnswer:
          "To algorithmically generate large numbers of pseudo-random domain names for C2 communication, making blocking difficult",
        explanation:
          "DGAs generate hundreds or thousands of pseudo-random domain names that the malware tries to resolve. The attacker only needs to register a few of these domains to establish C2 communication. The high volume of potential domains makes static blacklisting impractical; detection requires behavioral analysis.",
      },
    ],
  },
  {
    topicName: "DNS Security",
    concept: "Split-horizon DNS (split DNS)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is split-horizon DNS (split DNS)?",
        choices: [
          "A DNS configuration that provides different answers depending on whether the query comes from internal or external networks",
          "A technique for distributing DNS queries across multiple servers for load balancing",
          "A method for encrypting DNS traffic between internal and external resolvers",
          "A redundancy technique that maintains identical DNS zones on two separate servers",
        ],
        correctAnswer:
          "A DNS configuration that provides different answers depending on whether the query comes from internal or external networks",
        explanation:
          "Split-horizon DNS returns different DNS records depending on the source of the query. Internal users may receive private IP addresses, while external users receive public IPs. This prevents exposure of internal network topology to the outside world while providing seamless name resolution for internal users.",
      },
    ],
  },

  // =======================================================================
  // Wireless Security (13 nodes)
  // =======================================================================
  {
    topicName: "Wireless Security",
    concept: "WPA3 and its improvements over WPA2",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What key security improvement does WPA3 provide over WPA2?",
        choices: [
          "WPA3 uses faster wireless frequencies",
          "WPA3 uses Simultaneous Authentication of Equals (SAE), which protects against offline dictionary attacks on the handshake",
          "WPA3 eliminates the need for passwords entirely",
          "WPA3 only works with 5 GHz wireless bands",
        ],
        correctAnswer:
          "WPA3 uses Simultaneous Authentication of Equals (SAE), which protects against offline dictionary attacks on the handshake",
        explanation:
          "WPA3 replaces WPA2's Pre-Shared Key (PSK) handshake with SAE (also known as Dragonfly), which provides protection against offline dictionary attacks. Even if an attacker captures the handshake, they cannot perform offline brute-force attacks against the password.",
      },
    ],
  },
  {
    topicName: "Wireless Security",
    concept: "WEP and why it is insecure",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is WEP (Wired Equivalent Privacy) considered fundamentally broken?",
        choices: [
          "WEP uses too long of an encryption key, causing performance issues",
          "WEP uses the RC4 cipher with weak initialization vectors (IVs), allowing the key to be recovered by capturing enough traffic",
          "WEP requires manual key exchange, which is inconvenient",
          "WEP does not support any form of authentication",
        ],
        correctAnswer:
          "WEP uses the RC4 cipher with weak initialization vectors (IVs), allowing the key to be recovered by capturing enough traffic",
        explanation:
          "WEP uses 24-bit initialization vectors (IVs) with the RC4 stream cipher. The short IV space leads to IV reuse, and cryptographic weaknesses allow attackers to recover the WEP key by capturing a sufficient number of packets. WEP can be cracked in minutes with modern tools.",
      },
    ],
  },
  {
    topicName: "Wireless Security",
    concept: "Evil twin access point attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is an evil twin attack in wireless networking?",
        choices: [
          "An attack where two users share the same wireless credentials simultaneously",
          "An attacker sets up a rogue access point mimicking a legitimate network to intercept user traffic",
          "An attack that jams all wireless frequencies in an area",
          "An attack that duplicates MAC addresses to bypass authentication",
        ],
        correctAnswer:
          "An attacker sets up a rogue access point mimicking a legitimate network to intercept user traffic",
        explanation:
          "In an evil twin attack, the attacker creates a fake access point with the same SSID as a legitimate network. Unsuspecting users connect to the rogue AP, allowing the attacker to intercept credentials, inject malware, or perform man-in-the-middle attacks on all their traffic.",
      },
    ],
  },
  {
    topicName: "Wireless Security",
    concept: "Wireless deauthentication attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a wireless deauthentication attack?",
        choices: [
          "An attack that changes the SSID of a wireless network",
          "Sending forged deauthentication frames to disconnect clients from an access point",
          "An attack that encrypts all wireless traffic with the attacker's key",
          "An attack that physically disables wireless access points",
        ],
        correctAnswer:
          "Sending forged deauthentication frames to disconnect clients from an access point",
        explanation:
          "Deauthentication attacks exploit the unencrypted management frames in 802.11 to send forged deauth packets, forcing clients to disconnect from the AP. This can be used as a denial-of-service attack or to force clients to reconnect through an evil twin AP. 802.11w (PMF) mitigates this.",
      },
    ],
  },
  {
    topicName: "Wireless Security",
    concept: "WPA2-Enterprise and 802.1X authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What advantage does WPA2-Enterprise have over WPA2-Personal?",
        choices: [
          "WPA2-Enterprise uses stronger encryption algorithms",
          "WPA2-Enterprise authenticates each user individually via 802.1X and a RADIUS server, rather than using a shared password",
          "WPA2-Enterprise does not require an access point",
          "WPA2-Enterprise is faster because it skips the authentication step",
        ],
        correctAnswer:
          "WPA2-Enterprise authenticates each user individually via 802.1X and a RADIUS server, rather than using a shared password",
        explanation:
          "WPA2-Enterprise uses IEEE 802.1X and a RADIUS authentication server to authenticate each user individually with unique credentials (username/password, certificates, or tokens). This eliminates the shared password vulnerability of WPA2-Personal and provides per-user key derivation.",
      },
    ],
  },
  {
    topicName: "Wireless Security",
    concept: "Rogue access point detection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a rogue access point?",
        choices: [
          "An access point that has been updated with the latest firmware",
          "An unauthorized access point connected to the network, potentially bypassing security controls",
          "A backup access point used for failover",
          "An access point configured with WPA3 encryption",
        ],
        correctAnswer:
          "An unauthorized access point connected to the network, potentially bypassing security controls",
        explanation:
          "A rogue access point is an unauthorized AP connected to the corporate network, either maliciously by an attacker or inadvertently by an employee. It can bypass network security controls and provide unauthorized access to the internal network. Wireless IDS (WIDS) can detect rogue APs.",
      },
    ],
  },
  {
    topicName: "Wireless Security",
    concept: "SSID broadcasting and hiding",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Is hiding the SSID (disabling SSID broadcast) an effective security measure?",
        choices: [
          "Yes, it makes the network completely invisible and secure",
          "No, the SSID is still transmitted in probe requests and responses and can be easily discovered with wireless analysis tools",
          "Yes, but only if combined with WEP encryption",
          "No, because SSID hiding is not supported by modern access points",
        ],
        correctAnswer:
          "No, the SSID is still transmitted in probe requests and responses and can be easily discovered with wireless analysis tools",
        explanation:
          "Hiding the SSID only removes it from beacon frames. The SSID is still visible in probe requests from clients and probe responses from the AP, making it trivial to discover with tools like Wireshark or Kismet. SSID hiding provides no real security and is considered security through obscurity.",
      },
    ],
  },
  {
    topicName: "Wireless Security",
    concept: "MAC address filtering limitations",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is MAC address filtering alone insufficient for wireless security?",
        choices: [
          "MAC addresses are encrypted and cannot be read by the access point",
          "MAC addresses can be easily spoofed by an attacker who observes legitimate MAC addresses on the network",
          "MAC addresses change every time a device connects to a network",
          "MAC filtering only works with IPv6 networks",
        ],
        correctAnswer:
          "MAC addresses can be easily spoofed by an attacker who observes legitimate MAC addresses on the network",
        explanation:
          "MAC addresses are transmitted in cleartext in wireless frames and can be observed by anyone with a wireless sniffer. An attacker can easily change (spoof) their MAC address to match a whitelisted device, bypassing MAC filtering entirely. It should not be relied upon as a primary security control.",
      },
    ],
  },
  {
    topicName: "Wireless Security",
    concept: "Wireless intrusion detection systems (WIDS)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does a wireless intrusion detection system (WIDS) monitor for?",
        choices: [
          "Wired network traffic for protocol violations",
          "Rogue access points, unauthorized clients, deauthentication attacks, and other wireless threats",
          "Physical security of wireless access point hardware",
          "Internet bandwidth usage by wireless clients",
        ],
        correctAnswer:
          "Rogue access points, unauthorized clients, deauthentication attacks, and other wireless threats",
        explanation:
          "A WIDS uses dedicated sensors to monitor the wireless spectrum for security threats including rogue access points, evil twins, unauthorized clients, deauthentication attacks, and policy violations. It provides visibility into the wireless environment that wired security tools cannot offer.",
      },
    ],
  },
  {
    topicName: "Wireless Security",
    concept: "Protected Management Frames (802.11w/PMF)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What do Protected Management Frames (PMF/802.11w) protect against?",
        choices: [
          "Data eavesdropping on encrypted wireless networks",
          "Spoofing and forgery of management frames such as deauthentication and disassociation frames",
          "Unauthorized access to the wireless network",
          "Physical tampering with access point hardware",
        ],
        correctAnswer:
          "Spoofing and forgery of management frames such as deauthentication and disassociation frames",
        explanation:
          "IEEE 802.11w (PMF) adds cryptographic protection to management frames, preventing attackers from sending forged deauthentication, disassociation, and other management frames. PMF is mandatory in WPA3 and optional in WPA2, mitigating deauth attacks.",
      },
    ],
  },
  {
    topicName: "Wireless Security",
    concept: "Wi-Fi site surveys for security",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why are wireless site surveys important for security?",
        choices: [
          "They determine the fastest internet speed available at the site",
          "They map signal coverage to identify areas of signal leakage, interference, and optimal access point placement to minimize exposure",
          "They test the physical security of the building's entry points",
          "They replace the need for wireless encryption",
        ],
        correctAnswer:
          "They map signal coverage to identify areas of signal leakage, interference, and optimal access point placement to minimize exposure",
        explanation:
          "Wireless site surveys map RF signal strength and coverage throughout a facility. From a security perspective, they identify signal bleed beyond building boundaries (which attackers could exploit), co-channel interference, and optimal AP placement to provide coverage only where needed.",
      },
    ],
  },
  {
    topicName: "Wireless Security",
    concept: "KRACK attack against WPA2",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What vulnerability does the KRACK (Key Reinstallation Attack) exploit in WPA2?",
        choices: [
          "A weak random number generator used in WPA2 key derivation",
          "A flaw in the four-way handshake that allows an attacker to force nonce reuse, enabling traffic decryption",
          "A backdoor in the WPA2 encryption algorithm",
          "An unpatched buffer overflow in WPA2 supplicant software",
        ],
        correctAnswer:
          "A flaw in the four-way handshake that allows an attacker to force nonce reuse, enabling traffic decryption",
        explanation:
          "KRACK exploits a vulnerability in the WPA2 four-way handshake where an attacker can force the client to reinstall an already-in-use encryption key by replaying handshake messages. This causes nonce reuse, which can allow decryption and injection of traffic. Patches are available for most implementations.",
      },
    ],
  },
  {
    topicName: "Wireless Security",
    concept: "Captive portals for guest wireless access",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the security purpose of a captive portal for guest wireless access?",
        choices: [
          "To encrypt all guest traffic with WPA3",
          "To require guest users to agree to an acceptable use policy and authenticate before granting network access",
          "To block all internet access for guest users",
          "To assign permanent IP addresses to guest devices",
        ],
        correctAnswer:
          "To require guest users to agree to an acceptable use policy and authenticate before granting network access",
        explanation:
          "Captive portals intercept guest web requests and redirect them to an authentication or registration page. Guests must agree to acceptable use policies and/or provide credentials before gaining network access. This creates accountability and can segment guest traffic from the corporate network.",
      },
    ],
  },

  // =======================================================================
  // Network Monitoring (12 nodes)
  // =======================================================================
  {
    topicName: "Network Monitoring",
    concept: "SIEM systems and their role in security",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of a Security Information and Event Management (SIEM) system?",
        choices: [
          "To replace firewalls and intrusion detection systems",
          "To aggregate, correlate, and analyze security event data from multiple sources to detect threats and support incident response",
          "To encrypt all log data for long-term storage",
          "To automatically patch vulnerable systems across the network",
        ],
        correctAnswer:
          "To aggregate, correlate, and analyze security event data from multiple sources to detect threats and support incident response",
        explanation:
          "A SIEM collects log and event data from firewalls, IDS/IPS, servers, endpoints, and other sources. It correlates events across systems to detect complex attacks, provides alerting, dashboards, and supports forensic investigation and compliance reporting.",
      },
    ],
  },
  {
    topicName: "Network Monitoring",
    concept: "SNMP for network device monitoring",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is SNMP (Simple Network Management Protocol) used for?",
        choices: [
          "Encrypting traffic between network devices",
          "Monitoring and managing network devices by querying and receiving status information such as uptime, CPU usage, and interface errors",
          "Authenticating users on the network",
          "Routing packets between different subnets",
        ],
        correctAnswer:
          "Monitoring and managing network devices by querying and receiving status information such as uptime, CPU usage, and interface errors",
        explanation:
          "SNMP enables monitoring tools to query network devices (routers, switches, servers) for operational data such as uptime, interface statistics, CPU/memory usage, and error counts. SNMP v3 should be used as it provides authentication and encryption; v1 and v2c send community strings in cleartext.",
      },
    ],
  },
  {
    topicName: "Network Monitoring",
    concept: "Syslog for centralized log collection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of syslog in network security?",
        choices: [
          "To encrypt network traffic between devices",
          "To provide a standardized protocol for sending and collecting log messages from network devices and systems to a centralized server",
          "To scan the network for open ports and vulnerabilities",
          "To assign IP addresses to network devices",
        ],
        correctAnswer:
          "To provide a standardized protocol for sending and collecting log messages from network devices and systems to a centralized server",
        explanation:
          "Syslog is a standard protocol for forwarding log messages from network devices, servers, and applications to a centralized log server or SIEM. Centralized logging is essential for security monitoring, correlation, and forensic investigation. Syslog typically uses UDP port 514 or TCP port 514.",
      },
    ],
  },
  {
    topicName: "Network Monitoring",
    concept: "Network performance monitoring vs. security monitoring",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does network security monitoring differ from network performance monitoring?",
        choices: [
          "Security monitoring focuses only on bandwidth utilization",
          "Security monitoring analyzes network activity for threats, vulnerabilities, and policy violations; performance monitoring focuses on availability and throughput",
          "Performance monitoring includes malware analysis while security monitoring does not",
          "There is no difference; they are the same discipline",
        ],
        correctAnswer:
          "Security monitoring analyzes network activity for threats, vulnerabilities, and policy violations; performance monitoring focuses on availability and throughput",
        explanation:
          "Network security monitoring (NSM) focuses on detecting threats, anomalies, and policy violations by analyzing traffic patterns, logs, and alerts. Network performance monitoring focuses on availability, latency, throughput, and error rates. Both are complementary and important for network operations.",
      },
    ],
  },
  {
    topicName: "Network Monitoring",
    concept: "Log retention and forensic readiness",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is log retention important for network security?",
        choices: [
          "Logs are only needed for real-time monitoring and can be deleted immediately",
          "Retained logs enable forensic investigation of past incidents, support compliance requirements, and help identify long-term attack campaigns",
          "Log retention is only required for regulatory compliance and has no security benefit",
          "Logs should be kept for exactly 24 hours and then deleted for privacy",
        ],
        correctAnswer:
          "Retained logs enable forensic investigation of past incidents, support compliance requirements, and help identify long-term attack campaigns",
        explanation:
          "Log retention is critical because attacks are often discovered days, weeks, or months after initial compromise. Historical logs enable forensic reconstruction of incidents, identification of advanced persistent threats, and compliance with regulations that mandate specific retention periods.",
      },
    ],
  },
  {
    topicName: "Network Monitoring",
    concept: "Network vulnerability scanning",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of network vulnerability scanning?",
        choices: [
          "To block all network traffic until vulnerabilities are patched",
          "To identify known vulnerabilities, misconfigurations, and missing patches on network devices and systems",
          "To encrypt network traffic to prevent exploitation",
          "To monitor real-time network traffic for active attacks",
        ],
        correctAnswer:
          "To identify known vulnerabilities, misconfigurations, and missing patches on network devices and systems",
        explanation:
          "Vulnerability scanners (like Nessus, Qualys, or OpenVAS) probe network devices, servers, and applications to identify known vulnerabilities, misconfigurations, default credentials, and missing patches. Regular scanning helps organizations prioritize remediation before attackers can exploit these weaknesses.",
      },
    ],
  },
  {
    topicName: "Network Monitoring",
    concept: "Security orchestration, automation, and response (SOAR)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does a SOAR platform provide for security operations?",
        choices: [
          "Hardware-level encryption for all network traffic",
          "Automated incident response workflows, integration of security tools, and orchestration of repetitive security tasks",
          "Physical access control for server rooms",
          "Backup and disaster recovery for security logs",
        ],
        correctAnswer:
          "Automated incident response workflows, integration of security tools, and orchestration of repetitive security tasks",
        explanation:
          "SOAR platforms automate and orchestrate security operations by integrating multiple security tools, automating repetitive tasks (such as enriching alerts with threat intelligence), and executing predefined playbooks for incident response. This reduces mean time to respond and alleviates analyst workload.",
      },
    ],
  },
  {
    topicName: "Network Monitoring",
    concept: "Threat hunting on the network",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What distinguishes threat hunting from traditional security monitoring?",
        choices: [
          "Threat hunting relies exclusively on automated alerts from security tools",
          "Threat hunting is a proactive, analyst-driven process of searching for hidden threats that have evaded automated detection",
          "Threat hunting only examines endpoint logs, not network traffic",
          "Threat hunting replaces the need for SIEM systems",
        ],
        correctAnswer:
          "Threat hunting is a proactive, analyst-driven process of searching for hidden threats that have evaded automated detection",
        explanation:
          "Threat hunting is a proactive approach where skilled analysts form hypotheses about potential threats and actively search through network traffic, logs, and endpoint data for indicators of compromise. It goes beyond passive alerting to uncover advanced threats that evade automated detection.",
      },
    ],
  },
  {
    topicName: "Network Monitoring",
    concept: "Network topology mapping for security",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is maintaining an accurate network topology map important for security?",
        choices: [
          "It allows the network to run faster by optimizing cable routes",
          "It provides visibility into all connected devices, connections, and segments, enabling identification of unauthorized assets and attack paths",
          "It replaces the need for network segmentation",
          "It automatically configures firewall rules based on the topology",
        ],
        correctAnswer:
          "It provides visibility into all connected devices, connections, and segments, enabling identification of unauthorized assets and attack paths",
        explanation:
          "An accurate network topology map provides a comprehensive view of all devices, connections, and network segments. Security teams use it to identify shadow IT, unauthorized devices, misconfigured segments, and potential attack paths. It is essential for incident response and attack surface management.",
      },
    ],
  },
  {
    topicName: "Network Monitoring",
    concept: "NTP security and time synchronization",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is accurate time synchronization (NTP) critical for network security monitoring?",
        choices: [
          "NTP prevents DDoS attacks by rate-limiting traffic",
          "Accurate timestamps across all devices enable proper log correlation, forensic analysis, and compliance with audit requirements",
          "NTP encrypts all log data during transmission",
          "NTP automatically detects clock-based attacks on the network",
        ],
        correctAnswer:
          "Accurate timestamps across all devices enable proper log correlation, forensic analysis, and compliance with audit requirements",
        explanation:
          "Consistent, accurate timestamps are essential for correlating events across multiple devices and systems during incident investigation. If device clocks are out of sync, reconstructing the timeline of an attack becomes extremely difficult. NTP should be secured with authentication to prevent time-spoofing attacks.",
      },
    ],
  },
  {
    topicName: "Network Monitoring",
    concept: "Honeypots and honeynets for threat detection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of deploying a honeypot on a network?",
        choices: [
          "To provide backup storage for production data",
          "To act as a decoy system that attracts attackers, enabling detection and analysis of attack methods",
          "To increase network bandwidth for legitimate users",
          "To serve as a secondary DNS resolver",
        ],
        correctAnswer:
          "To act as a decoy system that attracts attackers, enabling detection and analysis of attack methods",
        explanation:
          "A honeypot is a deliberately vulnerable decoy system designed to attract attackers. Any interaction with a honeypot is suspicious by definition, providing high-fidelity alerts. Honeypots help detect lateral movement, gather threat intelligence, and study attacker tactics without risking production systems.",
      },
    ],
  },
  {
    topicName: "Network Monitoring",
    concept: "Full packet capture vs. metadata-only monitoring",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the trade-off between full packet capture and metadata-only (flow) monitoring?",
        choices: [
          "Full packet capture provides less detail but uses more storage",
          "Full packet capture preserves complete content for forensic analysis but requires significantly more storage; metadata monitoring is more storage-efficient but lacks payload details",
          "Metadata monitoring provides more detail than full packet capture",
          "There is no difference in storage requirements between the two approaches",
        ],
        correctAnswer:
          "Full packet capture preserves complete content for forensic analysis but requires significantly more storage; metadata monitoring is more storage-efficient but lacks payload details",
        explanation:
          "Full packet capture (FPC) records every byte of network traffic, providing the richest data for forensic analysis but requiring massive storage (potentially terabytes per day). Metadata/flow monitoring records only connection summaries, requiring far less storage but lacking the ability to reconstruct packet payloads.",
      },
    ],
  },
];
