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
  name: "Security Principles",
  tier: 0,
  description:
    "Foundational cybersecurity concepts including the CIA triad, authentication, access control, risk assessment, threat modeling, common attacks, security controls, and cryptography basics.",
  prerequisites: [],
  displayOrder: 0,
};

export const topics: SeedTopic[] = [
  {
    name: "CIA Triad",
    complexityWeight: 1.0,
    displayOrder: 0,
  },
  {
    name: "Authentication & Authorization",
    complexityWeight: 1.2,
    displayOrder: 1,
  },
  {
    name: "Access Control",
    complexityWeight: 1.3,
    displayOrder: 2,
  },
  {
    name: "Risk Assessment",
    complexityWeight: 1.4,
    displayOrder: 3,
  },
  {
    name: "Threat Modeling",
    complexityWeight: 1.5,
    displayOrder: 4,
  },
  {
    name: "Common Attack Types",
    complexityWeight: 1.3,
    displayOrder: 5,
  },
  {
    name: "Security Controls",
    complexityWeight: 1.2,
    displayOrder: 6,
  },
  {
    name: "Cryptography Basics",
    complexityWeight: 1.6,
    displayOrder: 7,
  },
];

export const nodes: SeedNode[] = [
  // ─── CIA Triad (5 nodes) ───

  {
    topicName: "CIA Triad",
    concept: "Confidentiality",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which element of the CIA triad ensures that information is accessible only to those authorized to view it?",
        choices: [
          "Confidentiality",
          "Integrity",
          "Availability",
          "Accountability",
        ],
        correctAnswer: "Confidentiality",
        explanation:
          "Confidentiality ensures that sensitive information is accessed only by authorized individuals. Encryption, access controls, and data classification are common mechanisms for enforcing confidentiality.",
      },
    ],
  },
  {
    topicName: "CIA Triad",
    concept: "Integrity",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A hospital discovers that a patient's medication dosage was silently altered in the database. Which element of the CIA triad was violated?",
        choices: [
          "Integrity",
          "Confidentiality",
          "Availability",
          "Non-repudiation",
        ],
        correctAnswer: "Integrity",
        explanation:
          "Integrity ensures that data remains accurate and unaltered except by authorized changes. Hash functions, digital signatures, and checksums are used to detect unauthorized modifications.",
      },
    ],
  },
  {
    topicName: "CIA Triad",
    concept: "Availability",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A distributed denial-of-service (DDoS) attack takes a company's website offline for several hours. Which element of the CIA triad is primarily affected?",
        choices: [
          "Availability",
          "Confidentiality",
          "Integrity",
          "Authentication",
        ],
        correctAnswer: "Availability",
        explanation:
          "Availability ensures that systems and data are accessible to authorized users when needed. DDoS attacks directly target availability by overwhelming resources so legitimate users cannot access the service.",
      },
    ],
  },
  {
    topicName: "CIA Triad",
    concept: "CIA Triad overview",
    questionTemplates: [
      {
        type: "recognition",
        prompt: "What are the three components of the CIA triad in information security?",
        choices: [
          "Confidentiality, Integrity, Availability",
          "Control, Identity, Authentication",
          "Compliance, Investigation, Authorization",
          "Containment, Isolation, Assessment",
        ],
        correctAnswer: "Confidentiality, Integrity, Availability",
        explanation:
          "The CIA triad is the foundational model in information security. Confidentiality protects data from unauthorized disclosure, integrity ensures data accuracy, and availability ensures systems are accessible when needed.",
      },
    ],
  },
  {
    topicName: "CIA Triad",
    concept: "Non-repudiation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which security property prevents a sender from denying that they sent a message?",
        choices: [
          "Non-repudiation",
          "Confidentiality",
          "Availability",
          "Obfuscation",
        ],
        correctAnswer: "Non-repudiation",
        explanation:
          "Non-repudiation provides proof of the origin and integrity of data, making it impossible for the sender to deny having sent it. Digital signatures are the primary mechanism for achieving non-repudiation.",
      },
    ],
  },

  // ─── Authentication & Authorization (6 nodes) ───

  {
    topicName: "Authentication & Authorization",
    concept: "Authentication vs. authorization",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary difference between authentication and authorization?",
        choices: [
          "Authentication verifies identity; authorization determines access permissions",
          "Authentication determines access permissions; authorization verifies identity",
          "Authentication encrypts data; authorization decrypts data",
          "Authentication and authorization are the same process",
        ],
        correctAnswer:
          "Authentication verifies identity; authorization determines access permissions",
        explanation:
          "Authentication (AuthN) confirms who a user is, while authorization (AuthZ) determines what that verified user is allowed to do. Authentication must occur before authorization.",
      },
    ],
  },
  {
    topicName: "Authentication & Authorization",
    concept: "Multi-factor authentication (MFA)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which combination represents true multi-factor authentication?",
        choices: [
          "A password and a one-time code from an authenticator app",
          "A password and a security question",
          "A fingerprint scan and a retina scan",
          "A PIN and a password",
        ],
        correctAnswer: "A password and a one-time code from an authenticator app",
        explanation:
          "True MFA requires factors from different categories: something you know (password), something you have (authenticator app), or something you are (biometric). A password plus a security question are both 'something you know,' so that is single-factor.",
      },
    ],
  },
  {
    topicName: "Authentication & Authorization",
    concept: "Authentication factors",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A fingerprint scanner used for login is an example of which authentication factor?",
        choices: [
          "Something you are",
          "Something you know",
          "Something you have",
          "Somewhere you are",
        ],
        correctAnswer: "Something you are",
        explanation:
          "Biometric identifiers like fingerprints, retina patterns, and facial geometry fall under the 'something you are' factor. This category relies on inherent physical or behavioral characteristics unique to the individual.",
      },
    ],
  },
  {
    topicName: "Authentication & Authorization",
    concept: "OAuth 2.0",
    questionTemplates: [
      {
        type: "recognition",
        prompt: "What is the primary purpose of OAuth 2.0?",
        choices: [
          "Delegated authorization — allowing a third-party application to access resources on behalf of a user",
          "Encrypting data at rest on a database server",
          "Scanning networks for open ports and vulnerabilities",
          "Establishing a VPN tunnel between two networks",
        ],
        correctAnswer:
          "Delegated authorization — allowing a third-party application to access resources on behalf of a user",
        explanation:
          "OAuth 2.0 is an authorization framework that enables third-party applications to obtain limited access to a user's resources without exposing their credentials. It issues access tokens rather than sharing passwords.",
      },
    ],
  },
  {
    topicName: "Authentication & Authorization",
    concept: "Single sign-on (SSO)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a primary benefit of single sign-on (SSO) for an organization?",
        choices: [
          "Users authenticate once and gain access to multiple applications without re-entering credentials",
          "Each application maintains its own independent credential store",
          "Users must create unique passwords for every application",
          "It eliminates the need for any form of authentication",
        ],
        correctAnswer:
          "Users authenticate once and gain access to multiple applications without re-entering credentials",
        explanation:
          "SSO allows users to log in once and access multiple related systems. This reduces password fatigue, lowers help-desk costs for password resets, and can improve security by centralizing authentication policy enforcement.",
      },
    ],
  },
  {
    topicName: "Authentication & Authorization",
    concept: "Principle of least privilege",
    questionTemplates: [
      {
        type: "recognition",
        prompt: "What does the principle of least privilege state?",
        choices: [
          "Users should be granted only the minimum access necessary to perform their job functions",
          "All users should have administrator-level access to simplify management",
          "Privileges should be assigned based on seniority within the organization",
          "Access rights should be reviewed only during annual audits",
        ],
        correctAnswer:
          "Users should be granted only the minimum access necessary to perform their job functions",
        explanation:
          "The principle of least privilege limits each user's access rights to the bare minimum needed for their role. This reduces the attack surface and limits the potential damage from compromised accounts or insider threats.",
      },
    ],
  },

  // ─── Access Control (5 nodes) ───

  {
    topicName: "Access Control",
    concept: "Role-based access control (RBAC)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In role-based access control (RBAC), how are permissions assigned?",
        choices: [
          "Permissions are assigned to roles, and users are assigned to roles",
          "Permissions are assigned directly to individual users",
          "The resource owner decides who can access each resource",
          "A central authority assigns security labels to data and users",
        ],
        correctAnswer:
          "Permissions are assigned to roles, and users are assigned to roles",
        explanation:
          "RBAC assigns permissions to defined roles (e.g., 'editor,' 'auditor') rather than to individual users. Users inherit permissions through their role assignments, simplifying administration in large organizations.",
      },
    ],
  },
  {
    topicName: "Access Control",
    concept: "Mandatory access control (MAC)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which access control model uses security labels (e.g., Top Secret, Secret, Confidential) enforced by a central authority?",
        choices: [
          "Mandatory Access Control (MAC)",
          "Discretionary Access Control (DAC)",
          "Role-Based Access Control (RBAC)",
          "Attribute-Based Access Control (ABAC)",
        ],
        correctAnswer: "Mandatory Access Control (MAC)",
        explanation:
          "MAC assigns security labels to both subjects and objects, and a central authority enforces access rules based on those labels. It is commonly used in military and government environments where strict data classification is required.",
      },
    ],
  },
  {
    topicName: "Access Control",
    concept: "Discretionary access control (DAC)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In discretionary access control (DAC), who determines access to a resource?",
        choices: [
          "The resource owner",
          "A central security administrator",
          "The operating system kernel exclusively",
          "An automated risk scoring engine",
        ],
        correctAnswer: "The resource owner",
        explanation:
          "In DAC, the owner of a resource decides who is granted access. Standard Unix file permissions are a classic example: the file owner can set read, write, and execute permissions for owner, group, and others.",
      },
    ],
  },
  {
    topicName: "Access Control",
    concept: "Attribute-based access control (ABAC)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which access control model evaluates policies based on attributes of the user, resource, action, and environment?",
        choices: [
          "Attribute-Based Access Control (ABAC)",
          "Role-Based Access Control (RBAC)",
          "Mandatory Access Control (MAC)",
          "Rule-Based Access Control",
        ],
        correctAnswer: "Attribute-Based Access Control (ABAC)",
        explanation:
          "ABAC makes access decisions by evaluating attributes (user department, resource sensitivity, time of day, location, etc.) against policies. This provides fine-grained, context-aware access control beyond what static roles can express.",
      },
    ],
  },
  {
    topicName: "Access Control",
    concept: "Separation of duties",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the goal of separation of duties in access control?",
        choices: [
          "To require more than one person to complete a critical task, preventing fraud or error",
          "To ensure all employees share the same access level for transparency",
          "To assign all critical functions to the most senior employee",
          "To allow any employee to substitute for any other in an emergency",
        ],
        correctAnswer:
          "To require more than one person to complete a critical task, preventing fraud or error",
        explanation:
          "Separation of duties divides critical functions among multiple people so that no single individual can complete a high-risk action alone. For example, the person who requests a payment should not be the same person who approves it.",
      },
    ],
  },

  // ─── Risk Assessment (5 nodes) ───

  {
    topicName: "Risk Assessment",
    concept: "Risk definition",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In cybersecurity, risk is most accurately defined as the combination of which two factors?",
        choices: [
          "The likelihood of a threat exploiting a vulnerability and the resulting impact",
          "The number of firewalls deployed and their configuration complexity",
          "The cost of security software and the number of IT staff",
          "The number of users and the number of devices on the network",
        ],
        correctAnswer:
          "The likelihood of a threat exploiting a vulnerability and the resulting impact",
        explanation:
          "Risk is commonly expressed as Risk = Likelihood x Impact. Likelihood refers to the probability of a threat exploiting a specific vulnerability, and impact refers to the resulting harm to the organization.",
      },
    ],
  },
  {
    topicName: "Risk Assessment",
    concept: "Vulnerability vs. threat vs. exploit",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An unpatched software flaw in a web server is best described as which of the following?",
        choices: [
          "A vulnerability",
          "A threat",
          "An exploit",
          "A risk",
        ],
        correctAnswer: "A vulnerability",
        explanation:
          "A vulnerability is a weakness in a system that could be exploited. A threat is an actor or event that could exploit a vulnerability. An exploit is the specific technique or code used to take advantage of a vulnerability.",
      },
    ],
  },
  {
    topicName: "Risk Assessment",
    concept: "Risk mitigation strategies",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An organization decides to purchase cybersecurity insurance to handle potential data breach costs. Which risk response strategy is this?",
        choices: [
          "Risk transfer",
          "Risk avoidance",
          "Risk acceptance",
          "Risk mitigation",
        ],
        correctAnswer: "Risk transfer",
        explanation:
          "Risk transfer shifts the financial burden of a risk to a third party, such as an insurance provider. Other strategies include avoidance (eliminating the activity), mitigation (reducing likelihood or impact), and acceptance (acknowledging and absorbing the risk).",
      },
    ],
  },
  {
    topicName: "Risk Assessment",
    concept: "Quantitative risk analysis",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In quantitative risk analysis, what does Annual Loss Expectancy (ALE) represent?",
        choices: [
          "The expected monetary loss from a specific risk over one year",
          "The total IT security budget for the year",
          "The number of security incidents expected per year",
          "The percentage of assets vulnerable to attack",
        ],
        correctAnswer:
          "The expected monetary loss from a specific risk over one year",
        explanation:
          "ALE is calculated as Single Loss Expectancy (SLE) multiplied by the Annual Rate of Occurrence (ARO). It provides a dollar figure that helps organizations justify security investments by comparing ALE to the cost of countermeasures.",
      },
    ],
  },
  {
    topicName: "Risk Assessment",
    concept: "Qualitative risk analysis",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which characteristic best distinguishes qualitative risk analysis from quantitative risk analysis?",
        choices: [
          "Qualitative analysis uses subjective ratings (e.g., High/Medium/Low) rather than precise monetary values",
          "Qualitative analysis always produces more accurate results",
          "Qualitative analysis requires actuarial data and historical loss records",
          "Qualitative analysis is only used in the financial services industry",
        ],
        correctAnswer:
          "Qualitative analysis uses subjective ratings (e.g., High/Medium/Low) rather than precise monetary values",
        explanation:
          "Qualitative risk analysis categorizes risks using descriptive scales rather than exact dollar amounts. It is faster to perform and useful when precise data is unavailable, though it is less objective than quantitative analysis.",
      },
    ],
  },

  // ─── Threat Modeling (5 nodes) ───

  {
    topicName: "Threat Modeling",
    concept: "STRIDE model",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In the STRIDE threat model, what does the 'S' stand for?",
        choices: [
          "Spoofing",
          "Sniffing",
          "Scanning",
          "Sandboxing",
        ],
        correctAnswer: "Spoofing",
        explanation:
          "STRIDE stands for Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege. Developed at Microsoft, it is a widely used framework for systematically identifying threats to a system.",
      },
    ],
  },
  {
    topicName: "Threat Modeling",
    concept: "Threat modeling purpose",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary goal of threat modeling during the software development lifecycle?",
        choices: [
          "To identify and prioritize potential security threats before they are exploited",
          "To perform penetration testing on production systems",
          "To generate compliance reports for regulatory audits",
          "To create marketing materials about the product's security",
        ],
        correctAnswer:
          "To identify and prioritize potential security threats before they are exploited",
        explanation:
          "Threat modeling is a proactive process performed during design and development to identify potential threats, attack vectors, and vulnerabilities. Addressing threats early is far cheaper and more effective than fixing them after deployment.",
      },
    ],
  },
  {
    topicName: "Threat Modeling",
    concept: "Attack surface",
    questionTemplates: [
      {
        type: "recognition",
        prompt: "What does 'attack surface' refer to in cybersecurity?",
        choices: [
          "The total number of points where an unauthorized user could attempt to enter or extract data from a system",
          "The physical area of a data center that is vulnerable to natural disasters",
          "The number of antivirus signatures in a threat database",
          "The user interface of a security monitoring dashboard",
        ],
        correctAnswer:
          "The total number of points where an unauthorized user could attempt to enter or extract data from a system",
        explanation:
          "The attack surface encompasses all the ways an attacker could interact with and potentially exploit a system, including open ports, APIs, user input fields, and running services. Reducing the attack surface is a key security practice.",
      },
    ],
  },
  {
    topicName: "Threat Modeling",
    concept: "Data flow diagrams in threat modeling",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In threat modeling, why are data flow diagrams (DFDs) commonly used?",
        choices: [
          "To visualize how data moves through a system and identify trust boundaries where threats may arise",
          "To design the user interface layout of an application",
          "To calculate the exact financial impact of each threat",
          "To schedule penetration testing activities",
        ],
        correctAnswer:
          "To visualize how data moves through a system and identify trust boundaries where threats may arise",
        explanation:
          "DFDs map processes, data stores, external entities, and data flows. Trust boundaries on a DFD mark where data crosses between different privilege levels, and these boundaries are prime locations for identifying threats.",
      },
    ],
  },
  {
    topicName: "Threat Modeling",
    concept: "DREAD risk rating",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which of the following is a factor evaluated in the DREAD threat rating model?",
        choices: [
          "Reproducibility",
          "Resilience",
          "Redundancy",
          "Regression",
        ],
        correctAnswer: "Reproducibility",
        explanation:
          "DREAD stands for Damage potential, Reproducibility, Exploitability, Affected users, and Discoverability. Each factor is rated on a scale, and the scores are combined to prioritize which threats to address first.",
      },
    ],
  },

  // ─── Common Attack Types (6 nodes) ───

  {
    topicName: "Common Attack Types",
    concept: "Phishing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An employee receives an email that appears to be from their bank, asking them to click a link and enter their login credentials on a fake website. What type of attack is this?",
        choices: [
          "Phishing",
          "Brute force attack",
          "SQL injection",
          "Denial of service",
        ],
        correctAnswer: "Phishing",
        explanation:
          "Phishing uses deceptive emails, messages, or websites that impersonate legitimate entities to trick victims into revealing sensitive information like passwords or financial details. It exploits human trust rather than technical vulnerabilities.",
      },
    ],
  },
  {
    topicName: "Common Attack Types",
    concept: "SQL injection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker enters `' OR '1'='1` into a login form's username field to bypass authentication. What type of attack is this?",
        choices: [
          "SQL injection",
          "Cross-site scripting (XSS)",
          "Buffer overflow",
          "DNS spoofing",
        ],
        correctAnswer: "SQL injection",
        explanation:
          "SQL injection inserts malicious SQL code into input fields that are improperly sanitized, allowing attackers to manipulate database queries. Parameterized queries (prepared statements) are the primary defense against SQL injection.",
      },
    ],
  },
  {
    topicName: "Common Attack Types",
    concept: "Cross-site scripting (XSS)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker injects a malicious JavaScript snippet into a forum post. When other users view the post, the script executes in their browsers. What type of attack is this?",
        choices: [
          "Cross-site scripting (XSS)",
          "SQL injection",
          "Man-in-the-middle",
          "Privilege escalation",
        ],
        correctAnswer: "Cross-site scripting (XSS)",
        explanation:
          "XSS attacks inject client-side scripts into web pages viewed by other users. The stored (persistent) variant embeds the malicious script in the application's database, affecting all users who view the compromised content.",
      },
    ],
  },
  {
    topicName: "Common Attack Types",
    concept: "Man-in-the-middle (MITM) attack",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker secretly intercepts and relays communications between two parties who believe they are communicating directly with each other. What type of attack is this?",
        choices: [
          "Man-in-the-middle (MITM)",
          "Phishing",
          "Denial of service",
          "Brute force",
        ],
        correctAnswer: "Man-in-the-middle (MITM)",
        explanation:
          "In a MITM attack, the attacker positions themselves between two communicating parties to eavesdrop or alter the traffic. TLS/SSL encryption and certificate pinning are key defenses against MITM attacks.",
      },
    ],
  },
  {
    topicName: "Common Attack Types",
    concept: "Social engineering",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker calls an employee pretending to be from the IT help desk and convinces them to reveal their password. This is an example of what type of attack?",
        choices: [
          "Social engineering",
          "Brute force attack",
          "Zero-day exploit",
          "Buffer overflow",
        ],
        correctAnswer: "Social engineering",
        explanation:
          "Social engineering manipulates people into breaking security procedures or divulging confidential information. It targets human psychology rather than technical systems and includes techniques like pretexting, baiting, and tailgating.",
      },
    ],
  },
  {
    topicName: "Common Attack Types",
    concept: "Ransomware",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Malware that encrypts a victim's files and demands payment for the decryption key is known as what?",
        choices: [
          "Ransomware",
          "Spyware",
          "Adware",
          "Rootkit",
        ],
        correctAnswer: "Ransomware",
        explanation:
          "Ransomware encrypts the victim's data and demands a ransom, usually in cryptocurrency, for the decryption key. Regular offline backups, network segmentation, and prompt patching are critical defenses against ransomware.",
      },
    ],
  },

  // ─── Security Controls (5 nodes) ───

  {
    topicName: "Security Controls",
    concept: "Preventive controls",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A firewall that blocks unauthorized inbound traffic is an example of what type of security control?",
        choices: [
          "Preventive control",
          "Detective control",
          "Corrective control",
          "Compensating control",
        ],
        correctAnswer: "Preventive control",
        explanation:
          "Preventive controls stop security incidents before they occur. Firewalls, encryption, access control lists, and security awareness training are all examples of controls designed to prevent unauthorized activity.",
      },
    ],
  },
  {
    topicName: "Security Controls",
    concept: "Detective controls",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An intrusion detection system (IDS) that monitors network traffic for suspicious patterns is an example of what type of security control?",
        choices: [
          "Detective control",
          "Preventive control",
          "Corrective control",
          "Deterrent control",
        ],
        correctAnswer: "Detective control",
        explanation:
          "Detective controls identify and alert on security events that have occurred or are in progress. IDS, log monitoring, security audits, and file integrity monitoring are detective controls that help organizations discover breaches.",
      },
    ],
  },
  {
    topicName: "Security Controls",
    concept: "Defense in depth",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the principle of defense in depth?",
        choices: [
          "Layering multiple security controls so that if one fails, others still provide protection",
          "Investing the entire security budget in the single strongest control available",
          "Focusing all security efforts on the network perimeter",
          "Deploying the same security control at every layer of the network",
        ],
        correctAnswer:
          "Layering multiple security controls so that if one fails, others still provide protection",
        explanation:
          "Defense in depth uses multiple overlapping layers of security — physical, technical, and administrative — so that the compromise of any single control does not result in a full breach. It is a cornerstone of resilient security architecture.",
      },
    ],
  },
  {
    topicName: "Security Controls",
    concept: "Administrative controls",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which of the following is an example of an administrative (managerial) security control?",
        choices: [
          "A security awareness training program for employees",
          "A firewall blocking inbound traffic on port 23",
          "An antivirus scanner running on all workstations",
          "A biometric door lock on the server room",
        ],
        correctAnswer: "A security awareness training program for employees",
        explanation:
          "Administrative controls are policies, procedures, and training programs that guide human behavior. They include security policies, background checks, incident response plans, and awareness training.",
      },
    ],
  },
  {
    topicName: "Security Controls",
    concept: "Compensating controls",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "When an organization cannot implement a primary security control, what type of control serves as an alternative to address the same risk?",
        choices: [
          "Compensating control",
          "Deterrent control",
          "Directive control",
          "Recovery control",
        ],
        correctAnswer: "Compensating control",
        explanation:
          "Compensating controls are alternative measures deployed when the primary control is not feasible. For example, if a legacy system cannot support encryption, enhanced monitoring and network segmentation might serve as compensating controls.",
      },
    ],
  },

  // ─── Cryptography Basics (8 nodes) ───

  {
    topicName: "Cryptography Basics",
    concept: "Symmetric encryption",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which type of encryption uses the same key for both encrypting and decrypting data?",
        choices: [
          "Symmetric encryption",
          "Asymmetric encryption",
          "Hash functions",
          "Digital signatures",
        ],
        correctAnswer: "Symmetric encryption",
        explanation:
          "Symmetric encryption uses a single shared secret key for both encryption and decryption. AES (Advanced Encryption Standard) is the most widely used symmetric algorithm. It is fast but requires secure key distribution.",
      },
    ],
  },
  {
    topicName: "Cryptography Basics",
    concept: "Asymmetric encryption",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In asymmetric encryption, which key is used to encrypt a message intended for a specific recipient?",
        choices: [
          "The recipient's public key",
          "The sender's private key",
          "The recipient's private key",
          "A shared symmetric key",
        ],
        correctAnswer: "The recipient's public key",
        explanation:
          "In asymmetric encryption, the sender encrypts data with the recipient's public key. Only the recipient's corresponding private key can decrypt it. RSA and elliptic curve cryptography (ECC) are common asymmetric algorithms.",
      },
    ],
  },
  {
    topicName: "Cryptography Basics",
    concept: "Hash functions",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which property of a cryptographic hash function means it is computationally infeasible to find two different inputs that produce the same hash output?",
        choices: [
          "Collision resistance",
          "Reversibility",
          "Key derivation",
          "Homomorphism",
        ],
        correctAnswer: "Collision resistance",
        explanation:
          "Collision resistance means it should be extremely difficult to find two distinct inputs that hash to the same output. SHA-256 and SHA-3 are modern hash functions designed with strong collision resistance.",
      },
    ],
  },
  {
    topicName: "Cryptography Basics",
    concept: "Digital signatures",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "When creating a digital signature, which key does the signer use?",
        choices: [
          "The signer's private key",
          "The signer's public key",
          "The recipient's public key",
          "A shared symmetric key",
        ],
        correctAnswer: "The signer's private key",
        explanation:
          "A digital signature is created by encrypting a hash of the message with the signer's private key. Recipients verify it using the signer's public key. This provides authentication, integrity, and non-repudiation.",
      },
    ],
  },
  {
    topicName: "Cryptography Basics",
    concept: "TLS/SSL",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of TLS (Transport Layer Security) in web communications?",
        choices: [
          "To encrypt data in transit between a client and a server",
          "To compress web pages for faster loading",
          "To authenticate users with biometric data",
          "To block malware downloads from the internet",
        ],
        correctAnswer:
          "To encrypt data in transit between a client and a server",
        explanation:
          "TLS encrypts the communication channel between a client (e.g., browser) and a server, ensuring confidentiality and integrity of data in transit. It uses a combination of asymmetric encryption for key exchange and symmetric encryption for data transfer.",
      },
    ],
  },
  {
    topicName: "Cryptography Basics",
    concept: "Public key infrastructure (PKI)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What role does a Certificate Authority (CA) play in public key infrastructure (PKI)?",
        choices: [
          "It issues and vouches for the authenticity of digital certificates that bind public keys to identities",
          "It generates symmetric encryption keys for all users on a network",
          "It scans websites for malware and phishing content",
          "It provides physical access control to data centers",
        ],
        correctAnswer:
          "It issues and vouches for the authenticity of digital certificates that bind public keys to identities",
        explanation:
          "A Certificate Authority is a trusted third party that verifies the identity of entities and issues digital certificates. These certificates bind a public key to an identity, enabling others to trust that the key genuinely belongs to the claimed owner.",
      },
    ],
  },
  {
    topicName: "Cryptography Basics",
    concept: "Encryption at rest vs. in transit",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Full-disk encryption on a laptop protects data in which state?",
        choices: [
          "At rest",
          "In transit",
          "In use",
          "In processing",
        ],
        correctAnswer: "At rest",
        explanation:
          "Data at rest refers to data stored on a device (disk, database, backup tape). Full-disk encryption like BitLocker or LUKS protects data at rest by encrypting the entire storage volume, guarding against data theft if the device is lost or stolen.",
      },
    ],
  },
  {
    topicName: "Cryptography Basics",
    concept: "Key exchange problem",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "The Diffie-Hellman algorithm is primarily used to solve which cryptographic problem?",
        choices: [
          "Securely exchanging cryptographic keys over an insecure channel",
          "Compressing large files for efficient storage",
          "Generating random passwords for user accounts",
          "Detecting unauthorized modifications to a file",
        ],
        correctAnswer:
          "Securely exchanging cryptographic keys over an insecure channel",
        explanation:
          "Diffie-Hellman allows two parties to establish a shared secret key over a public channel without ever transmitting the key itself. This solved the fundamental problem of symmetric key distribution and is foundational to modern secure communications.",
      },
    ],
  },
];
