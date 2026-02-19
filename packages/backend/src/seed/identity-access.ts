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
  name: "Identity & Access Management",
  tier: 1,
  description:
    "Authentication protocols, directory services, federation, SSO, and privilege management",
  prerequisites: [],
  displayOrder: 8,
};

export const topics: SeedTopic[] = [
  {
    name: "Authentication Fundamentals",
    complexityWeight: 1.0,
    displayOrder: 0,
  },
  {
    name: "Directory Services",
    complexityWeight: 1.2,
    displayOrder: 1,
  },
  {
    name: "Federation & SSO",
    complexityWeight: 1.3,
    displayOrder: 2,
  },
  {
    name: "Multi-Factor Authentication",
    complexityWeight: 1.1,
    displayOrder: 3,
  },
  {
    name: "Privilege Management",
    complexityWeight: 1.3,
    displayOrder: 4,
  },
  {
    name: "Access Control Models",
    complexityWeight: 1.2,
    displayOrder: 5,
  },
  {
    name: "Identity Governance",
    complexityWeight: 1.4,
    displayOrder: 6,
  },
  {
    name: "Zero Trust Identity",
    complexityWeight: 1.5,
    displayOrder: 7,
  },
];

export const nodes: SeedNode[] = [
  // ─── Authentication Fundamentals (13 nodes) ───

  {
    topicName: "Authentication Fundamentals",
    concept: "Authentication vs. identification",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the key difference between identification and authentication?",
        choices: [
          "Identification claims an identity; authentication proves it",
          "Identification proves an identity; authentication claims it",
          "Identification and authentication are the same process",
          "Identification is for users; authentication is for devices",
        ],
        correctAnswer:
          "Identification claims an identity; authentication proves it",
        explanation:
          "Identification is the act of claiming an identity (e.g., entering a username), while authentication is the process of verifying that claim (e.g., providing a password). Identification always precedes authentication in the access control process.",
      },
    ],
  },
  {
    topicName: "Authentication Fundamentals",
    concept: "Knowledge-based authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Passwords, PINs, and security questions are all examples of which authentication factor?",
        choices: [
          "Something you know",
          "Something you have",
          "Something you are",
          "Somewhere you are",
        ],
        correctAnswer: "Something you know",
        explanation:
          "Knowledge-based authentication relies on information that the user memorizes. This includes passwords, PINs, passphrases, and security questions. It is the most common but also the weakest factor, as knowledge can be guessed, phished, or stolen.",
      },
    ],
  },
  {
    topicName: "Authentication Fundamentals",
    concept: "Password hashing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why should passwords be stored as salted hashes rather than in plaintext or with reversible encryption?",
        choices: [
          "So that even if the database is compromised, the original passwords cannot be directly recovered",
          "To make passwords easier for users to remember",
          "To speed up the authentication process",
          "To allow administrators to recover forgotten passwords for users",
        ],
        correctAnswer:
          "So that even if the database is compromised, the original passwords cannot be directly recovered",
        explanation:
          "Hashing is a one-way function that converts a password into a fixed-length digest. Adding a unique salt to each password before hashing prevents attackers from using precomputed rainbow tables. bcrypt, scrypt, and Argon2 are purpose-built password hashing algorithms.",
      },
    ],
  },
  {
    topicName: "Authentication Fundamentals",
    concept: "Credential stuffing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker uses username-password pairs leaked from one breached website to attempt logins on many other websites. What is this attack called?",
        choices: [
          "Credential stuffing",
          "Brute force attack",
          "Password spraying",
          "Phishing",
        ],
        correctAnswer: "Credential stuffing",
        explanation:
          "Credential stuffing exploits password reuse by testing stolen credentials from one breach against multiple services. Unlike brute force, which guesses passwords, credential stuffing uses real credentials. MFA and breach-password detection are effective countermeasures.",
      },
    ],
  },
  {
    topicName: "Authentication Fundamentals",
    concept: "Password spraying",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker tries a single commonly used password (e.g., 'Password123') against many different user accounts before moving to the next password. What is this attack called?",
        choices: [
          "Password spraying",
          "Credential stuffing",
          "Dictionary attack",
          "Brute force attack",
        ],
        correctAnswer: "Password spraying",
        explanation:
          "Password spraying avoids account lockout thresholds by trying one password across many accounts rather than many passwords against one account. It is effective against organizations that allow weak passwords and do not enforce MFA.",
      },
    ],
  },
  {
    topicName: "Authentication Fundamentals",
    concept: "Kerberos authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In Kerberos authentication, what does the Key Distribution Center (KDC) issue to a user after successful initial authentication?",
        choices: [
          "A Ticket Granting Ticket (TGT)",
          "A digital certificate",
          "An OAuth access token",
          "A SAML assertion",
        ],
        correctAnswer: "A Ticket Granting Ticket (TGT)",
        explanation:
          "After authenticating to the KDC, a user receives a Ticket Granting Ticket (TGT). The TGT is then presented to the Ticket Granting Service (TGS) to obtain service tickets for accessing specific network resources without re-entering credentials.",
      },
    ],
  },
  {
    topicName: "Authentication Fundamentals",
    concept: "NTLM authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is NTLM authentication considered less secure than Kerberos in modern Windows environments?",
        choices: [
          "NTLM uses a challenge-response mechanism that is vulnerable to relay attacks and does not support mutual authentication",
          "NTLM requires a Certificate Authority, which introduces a single point of failure",
          "NTLM uses tickets that expire too quickly for practical use",
          "NTLM cannot work over a network and only supports local logins",
        ],
        correctAnswer:
          "NTLM uses a challenge-response mechanism that is vulnerable to relay attacks and does not support mutual authentication",
        explanation:
          "NTLM is a legacy protocol that does not authenticate the server to the client (no mutual authentication) and is susceptible to pass-the-hash and NTLM relay attacks. Microsoft recommends using Kerberos instead wherever possible.",
      },
    ],
  },
  {
    topicName: "Authentication Fundamentals",
    concept: "Certificate-based authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In certificate-based authentication, what does the client present to prove its identity?",
        choices: [
          "A digital certificate containing the client's public key, signed by a trusted Certificate Authority",
          "A one-time password generated by a hardware token",
          "A hashed version of the client's password",
          "The client's private key transmitted directly to the server",
        ],
        correctAnswer:
          "A digital certificate containing the client's public key, signed by a trusted Certificate Authority",
        explanation:
          "The client presents an X.509 digital certificate signed by a trusted CA. The server verifies the CA's signature and then challenges the client to prove possession of the corresponding private key, typically through a TLS handshake.",
      },
    ],
  },
  {
    topicName: "Authentication Fundamentals",
    concept: "Session tokens",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "After a user successfully authenticates to a web application, the server typically issues what to maintain the authenticated state across subsequent requests?",
        choices: [
          "A session token (often stored in a cookie)",
          "A new password for each request",
          "A Kerberos TGT",
          "A SAML identity provider URL",
        ],
        correctAnswer: "A session token (often stored in a cookie)",
        explanation:
          "Session tokens allow stateless HTTP to maintain user state. After authentication, the server creates a session and issues a token (commonly in a cookie). The token must be protected against theft via secure flags, HttpOnly, and short expiration times.",
      },
    ],
  },
  {
    topicName: "Authentication Fundamentals",
    concept: "Passwordless authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which of the following is an example of passwordless authentication?",
        choices: [
          "Using a FIDO2 security key to log in without entering a password",
          "Entering a password followed by a one-time code from an SMS",
          "Using a password manager to auto-fill a complex password",
          "Answering security questions after entering a username",
        ],
        correctAnswer:
          "Using a FIDO2 security key to log in without entering a password",
        explanation:
          "Passwordless authentication eliminates passwords entirely, relying instead on cryptographic keys, biometrics, or magic links. FIDO2/WebAuthn uses public-key cryptography with hardware authenticators, removing the risk of password-based attacks.",
      },
    ],
  },
  {
    topicName: "Authentication Fundamentals",
    concept: "Authentication protocols overview",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which authentication protocol is most commonly used in modern Active Directory environments for network authentication?",
        choices: [
          "Kerberos",
          "NTLM",
          "LDAP",
          "RADIUS",
        ],
        correctAnswer: "Kerberos",
        explanation:
          "Kerberos is the default authentication protocol in Active Directory since Windows 2000. It provides mutual authentication, uses time-limited tickets, and avoids transmitting passwords over the network, making it significantly more secure than NTLM.",
      },
    ],
  },
  {
    topicName: "Authentication Fundamentals",
    concept: "Brute force attack countermeasures",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which of the following is the most effective defense against brute force password attacks?",
        choices: [
          "Account lockout policies combined with rate limiting",
          "Using a longer username",
          "Storing passwords in plaintext for faster comparison",
          "Allowing unlimited login attempts to avoid locking out legitimate users",
        ],
        correctAnswer:
          "Account lockout policies combined with rate limiting",
        explanation:
          "Account lockout policies temporarily disable an account after a set number of failed attempts, while rate limiting slows down repeated attempts. Together they make brute force attacks impractical. Progressive delays and CAPTCHA are additional defenses.",
      },
    ],
  },
  {
    topicName: "Authentication Fundamentals",
    concept: "Single-factor vs. multi-factor authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A user logs in using only a password. What type of authentication is this?",
        choices: [
          "Single-factor authentication",
          "Multi-factor authentication",
          "Mutual authentication",
          "Federated authentication",
        ],
        correctAnswer: "Single-factor authentication",
        explanation:
          "Single-factor authentication uses only one category of authentication factor (in this case, something you know). It is less secure than multi-factor authentication because compromising one factor grants full access.",
      },
    ],
  },

  // ─── Directory Services (13 nodes) ───

  {
    topicName: "Directory Services",
    concept: "Active Directory overview",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is Microsoft Active Directory primarily used for in an enterprise environment?",
        choices: [
          "Centralized management of users, computers, and policies across a network domain",
          "Hosting web applications and serving static content",
          "Encrypting files stored on network shares",
          "Monitoring network traffic for intrusion attempts",
        ],
        correctAnswer:
          "Centralized management of users, computers, and policies across a network domain",
        explanation:
          "Active Directory (AD) is a directory service that stores information about network objects (users, computers, groups) and provides centralized authentication, authorization, and policy enforcement through Group Policy Objects (GPOs).",
      },
    ],
  },
  {
    topicName: "Directory Services",
    concept: "LDAP protocol",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is LDAP (Lightweight Directory Access Protocol) primarily used for?",
        choices: [
          "Querying and modifying directory services such as user accounts and group memberships",
          "Encrypting email communications between mail servers",
          "Transferring files between a client and a server",
          "Routing network packets between subnets",
        ],
        correctAnswer:
          "Querying and modifying directory services such as user accounts and group memberships",
        explanation:
          "LDAP is an open protocol for accessing and maintaining distributed directory information services. It operates over TCP/IP and is used to look up user accounts, authenticate users, and manage organizational data in directories like Active Directory and OpenLDAP.",
      },
    ],
  },
  {
    topicName: "Directory Services",
    concept: "Distinguished Names in LDAP",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In LDAP, what does a Distinguished Name (DN) represent?",
        choices: [
          "A unique identifier that specifies the exact location of an entry in the directory tree",
          "The encrypted form of a user's password",
          "A role-based access control permission set",
          "The IP address assigned to a domain controller",
        ],
        correctAnswer:
          "A unique identifier that specifies the exact location of an entry in the directory tree",
        explanation:
          "A Distinguished Name (DN) like 'CN=John Smith,OU=Engineering,DC=example,DC=com' uniquely identifies an entry in the LDAP directory tree. Each component (CN, OU, DC) represents a level in the hierarchical structure.",
      },
    ],
  },
  {
    topicName: "Directory Services",
    concept: "Organizational Units (OUs)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In Active Directory, what is the primary purpose of an Organizational Unit (OU)?",
        choices: [
          "To organize directory objects into logical containers for delegated administration and Group Policy application",
          "To provide physical network segmentation between departments",
          "To encrypt communications between domain controllers",
          "To store backup copies of the directory database",
        ],
        correctAnswer:
          "To organize directory objects into logical containers for delegated administration and Group Policy application",
        explanation:
          "OUs are containers within a domain that hold users, groups, computers, and other OUs. They enable administrators to delegate management of specific sets of objects and to apply Group Policy Objects to targeted collections of resources.",
      },
    ],
  },
  {
    topicName: "Directory Services",
    concept: "Group Policy Objects (GPOs)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the function of Group Policy Objects (GPOs) in Active Directory?",
        choices: [
          "To define and enforce configuration settings and security policies across users and computers in the domain",
          "To route network traffic between different VLANs",
          "To replicate files between domain controllers",
          "To generate audit reports for compliance purposes",
        ],
        correctAnswer:
          "To define and enforce configuration settings and security policies across users and computers in the domain",
        explanation:
          "GPOs allow administrators to centrally configure operating system settings, security policies, software installations, and user environment settings. GPOs can be linked to sites, domains, or OUs and are processed in a specific order (LSDOU).",
      },
    ],
  },
  {
    topicName: "Directory Services",
    concept: "Domain controller",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What role does a domain controller serve in an Active Directory environment?",
        choices: [
          "It hosts a copy of the AD database and handles authentication requests for the domain",
          "It serves as the organization's primary web server",
          "It acts as a firewall between internal and external networks",
          "It provides DHCP addresses to all network devices",
        ],
        correctAnswer:
          "It hosts a copy of the AD database and handles authentication requests for the domain",
        explanation:
          "A domain controller (DC) stores the Active Directory database (NTDS.dit) and processes authentication and authorization requests. Organizations deploy multiple DCs for redundancy, and changes replicate between them through AD replication.",
      },
    ],
  },
  {
    topicName: "Directory Services",
    concept: "AD forests and trusts",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In Active Directory, what is a forest?",
        choices: [
          "The top-level container that holds one or more domains sharing a common schema and global catalog",
          "A group of domain controllers in the same physical location",
          "A backup mechanism for the Active Directory database",
          "A type of Group Policy Object that applies to all domains",
        ],
        correctAnswer:
          "The top-level container that holds one or more domains sharing a common schema and global catalog",
        explanation:
          "A forest is the highest-level organizational structure in AD. All domains within a forest share a common schema, configuration, and global catalog. Trust relationships between forests enable cross-forest authentication and resource access.",
      },
    ],
  },
  {
    topicName: "Directory Services",
    concept: "LDAP injection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker manipulates an LDAP query by injecting special characters into a search input field to bypass authentication. What is this attack called?",
        choices: [
          "LDAP injection",
          "SQL injection",
          "Cross-site scripting",
          "Command injection",
        ],
        correctAnswer: "LDAP injection",
        explanation:
          "LDAP injection is similar to SQL injection but targets LDAP queries. Attackers insert characters like '*', '(', ')', and '|' to modify query logic. Input validation, parameterized queries, and escaping special characters are the primary defenses.",
      },
    ],
  },
  {
    topicName: "Directory Services",
    concept: "Global Catalog",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of the Global Catalog in Active Directory?",
        choices: [
          "To provide a searchable partial replica of all objects across all domains in the forest",
          "To store the complete Group Policy settings for every OU",
          "To maintain DNS records for all domain controllers",
          "To encrypt all LDAP communications within the forest",
        ],
        correctAnswer:
          "To provide a searchable partial replica of all objects across all domains in the forest",
        explanation:
          "The Global Catalog is a distributed data repository containing a partial, read-only replica of every object in the forest. It enables forest-wide searches and is essential for universal group membership resolution during logon.",
      },
    ],
  },
  {
    topicName: "Directory Services",
    concept: "Azure Active Directory",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does Microsoft Entra ID (formerly Azure Active Directory) differ from on-premises Active Directory?",
        choices: [
          "Entra ID is a cloud-based identity service that uses REST APIs and modern protocols like OAuth 2.0 and SAML, rather than LDAP and Kerberos",
          "Entra ID can only manage Windows devices, while on-premises AD supports all platforms",
          "Entra ID requires domain controllers deployed in the organization's data center",
          "Entra ID uses NTLM as its primary authentication protocol",
        ],
        correctAnswer:
          "Entra ID is a cloud-based identity service that uses REST APIs and modern protocols like OAuth 2.0 and SAML, rather than LDAP and Kerberos",
        explanation:
          "Microsoft Entra ID (Azure AD) is a cloud-native identity platform built on modern web standards. It supports OAuth 2.0, OpenID Connect, and SAML for authentication and authorization, and integrates with thousands of SaaS applications.",
      },
    ],
  },
  {
    topicName: "Directory Services",
    concept: "LDAPS and secure directory communication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does LDAPS provide that standard LDAP does not?",
        choices: [
          "TLS encryption of all LDAP traffic between clients and directory servers",
          "Faster query response times for large directories",
          "Automatic replication of directory data between servers",
          "Built-in multi-factor authentication for all LDAP binds",
        ],
        correctAnswer:
          "TLS encryption of all LDAP traffic between clients and directory servers",
        explanation:
          "LDAPS (LDAP over SSL/TLS) encrypts the entire LDAP session using TLS, protecting credentials and directory data from eavesdropping. Standard LDAP transmits data including bind passwords in cleartext, making it vulnerable to network sniffing.",
      },
    ],
  },
  {
    topicName: "Directory Services",
    concept: "Service accounts in AD",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a Managed Service Account (MSA) in Active Directory designed to provide?",
        choices: [
          "Automatic password management and simplified SPN management for service accounts",
          "A shared account that all administrators use for emergency access",
          "A temporary account that expires after a single use",
          "A user account with unlimited administrative privileges",
        ],
        correctAnswer:
          "Automatic password management and simplified SPN management for service accounts",
        explanation:
          "Managed Service Accounts and Group Managed Service Accounts (gMSAs) automatically handle password rotation and Service Principal Name (SPN) management. This reduces the risk of service account compromise from stale or weak passwords.",
      },
    ],
  },
  {
    topicName: "Directory Services",
    concept: "Directory schema",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In Active Directory, what does the schema define?",
        choices: [
          "The types of objects that can be stored and the attributes each object type can have",
          "The physical network topology of the domain",
          "The list of users who have administrator privileges",
          "The replication schedule between domain controllers",
        ],
        correctAnswer:
          "The types of objects that can be stored and the attributes each object type can have",
        explanation:
          "The AD schema is a formal definition of every object class (user, computer, group, etc.) and attribute (name, email, phone, etc.) in the directory. Schema modifications are forest-wide and should be planned carefully as they are difficult to reverse.",
      },
    ],
  },

  // ─── Federation & SSO (13 nodes) ───

  {
    topicName: "Federation & SSO",
    concept: "Federated identity management",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is federated identity management?",
        choices: [
          "A system that allows users to use the same identity credentials across multiple organizations or domains",
          "A method of storing all user passwords in a single encrypted database",
          "A type of firewall that filters traffic based on user identity",
          "A backup strategy for identity databases across data centers",
        ],
        correctAnswer:
          "A system that allows users to use the same identity credentials across multiple organizations or domains",
        explanation:
          "Federated identity management establishes trust between organizations so that a user authenticated by one organization (the identity provider) can access resources in another organization (the service provider) without creating separate accounts.",
      },
    ],
  },
  {
    topicName: "Federation & SSO",
    concept: "SAML 2.0",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of SAML 2.0 (Security Assertion Markup Language)?",
        choices: [
          "To exchange authentication and authorization data between an identity provider and a service provider using XML-based assertions",
          "To encrypt files stored in cloud storage services",
          "To scan web applications for security vulnerabilities",
          "To manage database access permissions for SQL queries",
        ],
        correctAnswer:
          "To exchange authentication and authorization data between an identity provider and a service provider using XML-based assertions",
        explanation:
          "SAML 2.0 is an XML-based open standard for exchanging identity information. The identity provider (IdP) authenticates the user and sends a signed SAML assertion to the service provider (SP), which grants access based on the assertion's contents.",
      },
    ],
  },
  {
    topicName: "Federation & SSO",
    concept: "OAuth 2.0 in federation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In the context of identity federation, what does OAuth 2.0 primarily provide?",
        choices: [
          "Delegated authorization, allowing applications to access resources on behalf of a user without sharing credentials",
          "Full user authentication with identity verification",
          "Encryption of data at rest in cloud storage",
          "Automatic provisioning of user accounts across systems",
        ],
        correctAnswer:
          "Delegated authorization, allowing applications to access resources on behalf of a user without sharing credentials",
        explanation:
          "OAuth 2.0 is an authorization framework, not an authentication protocol. It issues scoped access tokens that allow third-party applications to access protected resources on behalf of the user. OpenID Connect adds an authentication layer on top of OAuth 2.0.",
      },
    ],
  },
  {
    topicName: "Federation & SSO",
    concept: "OpenID Connect",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does OpenID Connect (OIDC) add on top of OAuth 2.0?",
        choices: [
          "An identity layer that provides user authentication and standardized identity claims via an ID token",
          "A file encryption mechanism for securing data in transit",
          "A vulnerability scanning capability for web applications",
          "A directory service for storing user accounts",
        ],
        correctAnswer:
          "An identity layer that provides user authentication and standardized identity claims via an ID token",
        explanation:
          "OpenID Connect extends OAuth 2.0 by adding an ID token (a signed JWT) containing claims about the authenticated user. This allows applications to verify user identity while still leveraging OAuth 2.0 for authorization.",
      },
    ],
  },
  {
    topicName: "Federation & SSO",
    concept: "Identity Provider (IdP) vs. Service Provider (SP)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In a SAML-based SSO architecture, what is the role of the Identity Provider (IdP)?",
        choices: [
          "To authenticate the user and issue a signed assertion confirming their identity to the Service Provider",
          "To host the web application that the user wants to access",
          "To encrypt network traffic between the user and the application",
          "To store the application's business data and logic",
        ],
        correctAnswer:
          "To authenticate the user and issue a signed assertion confirming their identity to the Service Provider",
        explanation:
          "The Identity Provider (IdP) is the trusted authority that verifies user credentials and issues SAML assertions. The Service Provider (SP) is the application or resource that relies on the IdP's assertion to grant access without maintaining its own credential store.",
      },
    ],
  },
  {
    topicName: "Federation & SSO",
    concept: "SSO security risks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a significant security risk of single sign-on (SSO)?",
        choices: [
          "If the SSO credential is compromised, an attacker gains access to all connected applications",
          "SSO forces users to remember different passwords for each application",
          "SSO prevents organizations from implementing multi-factor authentication",
          "SSO only works with on-premises applications and cannot be used with cloud services",
        ],
        correctAnswer:
          "If the SSO credential is compromised, an attacker gains access to all connected applications",
        explanation:
          "SSO creates a single point of compromise: one stolen credential unlocks all integrated applications. This is why SSO implementations should be protected with strong MFA, session timeouts, continuous monitoring, and robust IdP security.",
      },
    ],
  },
  {
    topicName: "Federation & SSO",
    concept: "JSON Web Tokens (JWT)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What are the three components of a JSON Web Token (JWT)?",
        choices: [
          "Header, Payload, and Signature",
          "Username, Password, and Token",
          "Public Key, Private Key, and Certificate",
          "Issuer, Subject, and Audience",
        ],
        correctAnswer: "Header, Payload, and Signature",
        explanation:
          "A JWT consists of three Base64URL-encoded parts separated by dots: the header (algorithm and token type), the payload (claims about the user), and the signature (cryptographic verification). JWTs are widely used in OIDC and API authentication.",
      },
    ],
  },
  {
    topicName: "Federation & SSO",
    concept: "Token-based authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a key advantage of token-based authentication over session-based authentication for distributed systems?",
        choices: [
          "Tokens are self-contained and can be validated without querying a central session store",
          "Tokens never expire and do not need to be refreshed",
          "Tokens are always shorter in length than session cookies",
          "Tokens cannot be stolen through network interception",
        ],
        correctAnswer:
          "Tokens are self-contained and can be validated without querying a central session store",
        explanation:
          "Token-based authentication (e.g., JWTs) embeds user claims directly in the token. Any service with the verification key can validate the token independently, making it ideal for microservices and distributed architectures where a shared session store would be a bottleneck.",
      },
    ],
  },
  {
    topicName: "Federation & SSO",
    concept: "WS-Federation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "WS-Federation is a federation protocol most commonly associated with which ecosystem?",
        choices: [
          "Microsoft enterprise environments using Active Directory Federation Services (AD FS)",
          "Linux-based web servers using Apache modules",
          "Mobile applications on iOS and Android",
          "Internet of Things (IoT) devices",
        ],
        correctAnswer:
          "Microsoft enterprise environments using Active Directory Federation Services (AD FS)",
        explanation:
          "WS-Federation is a WS-* standard for identity federation that is heavily used in Microsoft environments with AD FS. While SAML 2.0 and OIDC have become more prevalent for new implementations, WS-Federation remains common in legacy enterprise systems.",
      },
    ],
  },
  {
    topicName: "Federation & SSO",
    concept: "Token revocation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is revoking a JSON Web Token (JWT) more challenging than invalidating a server-side session?",
        choices: [
          "JWTs are stateless and self-contained, so the server has no central record to delete",
          "JWTs are encrypted and cannot be read by the server",
          "JWTs can only be used once and are automatically revoked after first use",
          "JWTs are stored on the server, making them harder to find and delete",
        ],
        correctAnswer:
          "JWTs are stateless and self-contained, so the server has no central record to delete",
        explanation:
          "Since JWTs carry all necessary claims and are validated by signature verification alone, there is no server-side state to delete. Common mitigation strategies include short token lifetimes, refresh token rotation, and maintaining a token blocklist.",
      },
    ],
  },
  {
    topicName: "Federation & SSO",
    concept: "Cross-domain SSO",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does SAML enable single sign-on across different internet domains?",
        choices: [
          "The IdP sends a signed assertion via the user's browser to the SP using HTTP redirects or POST, crossing domain boundaries",
          "The IdP shares the user's password directly with each SP over a VPN tunnel",
          "Cookies are shared between all domains participating in the SSO trust",
          "The user's browser sends the same session cookie to all domains automatically",
        ],
        correctAnswer:
          "The IdP sends a signed assertion via the user's browser to the SP using HTTP redirects or POST, crossing domain boundaries",
        explanation:
          "SAML uses browser redirects (HTTP-Redirect or HTTP-POST bindings) to pass assertions between different domains. Since cookies are domain-specific, SAML avoids relying on them by using the browser as an intermediary to relay signed assertions.",
      },
    ],
  },
  {
    topicName: "Federation & SSO",
    concept: "OAuth 2.0 grant types",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which OAuth 2.0 grant type is recommended for server-side web applications that can securely store a client secret?",
        choices: [
          "Authorization Code grant",
          "Implicit grant",
          "Client Credentials grant",
          "Resource Owner Password Credentials grant",
        ],
        correctAnswer: "Authorization Code grant",
        explanation:
          "The Authorization Code grant is the most secure OAuth 2.0 flow for web applications. The server exchanges an authorization code (received via the browser) for an access token in a server-to-server call, keeping the token out of the browser.",
      },
    ],
  },
  {
    topicName: "Federation & SSO",
    concept: "SCIM provisioning",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is SCIM (System for Cross-domain Identity Management) used for?",
        choices: [
          "Automating user provisioning and deprovisioning across cloud applications",
          "Encrypting SAML assertions between identity and service providers",
          "Scanning network devices for identity-related vulnerabilities",
          "Generating one-time passwords for multi-factor authentication",
        ],
        correctAnswer:
          "Automating user provisioning and deprovisioning across cloud applications",
        explanation:
          "SCIM is a REST-based protocol that standardizes how user identity data is created, updated, and deleted across different systems. It enables automatic provisioning when employees join and deprovisioning when they leave, reducing orphaned accounts.",
      },
    ],
  },

  // ─── Multi-Factor Authentication (13 nodes) ───

  {
    topicName: "Multi-Factor Authentication",
    concept: "MFA factor categories",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which of the following represents the three standard categories of authentication factors?",
        choices: [
          "Something you know, something you have, something you are",
          "Username, password, security question",
          "Password, PIN, passphrase",
          "Fingerprint, retina scan, facial recognition",
        ],
        correctAnswer:
          "Something you know, something you have, something you are",
        explanation:
          "The three standard authentication factor categories are knowledge (something you know, like a password), possession (something you have, like a phone or token), and inherence (something you are, like a fingerprint). True MFA requires factors from at least two different categories.",
      },
    ],
  },
  {
    topicName: "Multi-Factor Authentication",
    concept: "TOTP (Time-Based One-Time Password)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does a TOTP (Time-Based One-Time Password) authenticator app generate codes?",
        choices: [
          "By combining a shared secret key with the current time to produce a code that changes every 30 seconds",
          "By downloading a new code from the authentication server each time",
          "By using the device's GPS coordinates to generate a unique code",
          "By hashing the user's password with a random salt each time",
        ],
        correctAnswer:
          "By combining a shared secret key with the current time to produce a code that changes every 30 seconds",
        explanation:
          "TOTP (RFC 6238) uses a shared secret (established during enrollment) and the current Unix timestamp to generate a short-lived code. Both the authenticator app and the server independently compute the same code, enabling verification without network communication.",
      },
    ],
  },
  {
    topicName: "Multi-Factor Authentication",
    concept: "HOTP (HMAC-Based One-Time Password)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does HOTP differ from TOTP for one-time password generation?",
        choices: [
          "HOTP uses an incrementing counter instead of the current time to generate codes",
          "HOTP codes expire after 30 seconds, while TOTP codes never expire",
          "HOTP requires an internet connection, while TOTP works offline",
          "HOTP only works with hardware tokens, while TOTP only works with software",
        ],
        correctAnswer:
          "HOTP uses an incrementing counter instead of the current time to generate codes",
        explanation:
          "HOTP (RFC 4226) generates codes based on a shared secret and a counter value that increments with each use. Unlike TOTP, HOTP codes remain valid until used, which can be a security concern if a code is intercepted but not immediately used.",
      },
    ],
  },
  {
    topicName: "Multi-Factor Authentication",
    concept: "SMS-based MFA vulnerabilities",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is SMS-based MFA considered less secure than app-based TOTP or hardware security keys?",
        choices: [
          "SMS messages can be intercepted through SIM swapping attacks or SS7 protocol vulnerabilities",
          "SMS codes are longer and more complex than TOTP codes",
          "SMS requires the user to have a smartphone, while TOTP does not",
          "SMS codes are generated by the carrier, not by the authentication server",
        ],
        correctAnswer:
          "SMS messages can be intercepted through SIM swapping attacks or SS7 protocol vulnerabilities",
        explanation:
          "SMS-based MFA is vulnerable to SIM swapping (where an attacker convinces a carrier to transfer the victim's number), SS7 protocol exploitation, and malware that reads SMS messages. NIST recommends against SMS for MFA in high-security contexts.",
      },
    ],
  },
  {
    topicName: "Multi-Factor Authentication",
    concept: "Hardware security keys",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What makes FIDO2 hardware security keys (e.g., YubiKey) highly resistant to phishing attacks?",
        choices: [
          "The key cryptographically binds authentication to the specific origin URL, so credentials cannot be replayed on a fake site",
          "The key requires the user to type a password displayed on its screen",
          "The key stores the user's password and types it automatically",
          "The key encrypts all network traffic between the user and the server",
        ],
        correctAnswer:
          "The key cryptographically binds authentication to the specific origin URL, so credentials cannot be replayed on a fake site",
        explanation:
          "FIDO2/WebAuthn security keys use public-key cryptography bound to the origin (domain). The key will only respond to a challenge from the legitimate site, making phishing attacks ineffective because a fake domain would receive no valid response.",
      },
    ],
  },
  {
    topicName: "Multi-Factor Authentication",
    concept: "Push notification authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In push-based MFA, an attacker repeatedly sends authentication push notifications to a target's phone until they approve one. What is this attack called?",
        choices: [
          "MFA fatigue (push bombing)",
          "Credential stuffing",
          "SIM swapping",
          "Session hijacking",
        ],
        correctAnswer: "MFA fatigue (push bombing)",
        explanation:
          "MFA fatigue or push bombing floods the user with push notifications, hoping they will eventually approve one to stop the barrage. Number matching (requiring the user to enter a code shown on screen) is an effective countermeasure against this attack.",
      },
    ],
  },
  {
    topicName: "Multi-Factor Authentication",
    concept: "Biometric authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a key challenge with using biometrics (e.g., fingerprints) as an authentication factor?",
        choices: [
          "Biometric data cannot be changed if it is compromised, unlike a password",
          "Biometric data is too easy for users to forget",
          "Biometric scanners only work in well-lit environments",
          "Biometrics can only be used for physical access, not digital authentication",
        ],
        correctAnswer:
          "Biometric data cannot be changed if it is compromised, unlike a password",
        explanation:
          "Unlike passwords, biometric characteristics are permanent. If a fingerprint template is stolen from a database, the user cannot change their fingerprint. This is why biometrics should be used in combination with other factors and stored as irreversible templates.",
      },
    ],
  },
  {
    topicName: "Multi-Factor Authentication",
    concept: "Recovery codes",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of MFA recovery codes provided during enrollment?",
        choices: [
          "To allow account access if the primary MFA device is lost or unavailable",
          "To share with a colleague so they can access the account in an emergency",
          "To replace the user's password permanently",
          "To decrypt encrypted emails sent to the user",
        ],
        correctAnswer:
          "To allow account access if the primary MFA device is lost or unavailable",
        explanation:
          "Recovery codes are one-time-use backup codes generated during MFA setup. They provide an alternative authentication path when the user loses access to their primary MFA device. They should be stored securely offline and treated like passwords.",
      },
    ],
  },
  {
    topicName: "Multi-Factor Authentication",
    concept: "Adaptive MFA",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does adaptive (risk-based) MFA do differently from standard MFA?",
        choices: [
          "It adjusts the authentication requirements based on risk signals like location, device, and behavior",
          "It uses the same two factors for every login regardless of context",
          "It removes the MFA requirement for users who log in frequently",
          "It only requires MFA when the user changes their password",
        ],
        correctAnswer:
          "It adjusts the authentication requirements based on risk signals like location, device, and behavior",
        explanation:
          "Adaptive MFA evaluates contextual risk factors (IP address, geolocation, device fingerprint, login time, behavior patterns) and may step up authentication requirements for high-risk scenarios while reducing friction for low-risk ones.",
      },
    ],
  },
  {
    topicName: "Multi-Factor Authentication",
    concept: "MFA bypass techniques",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker uses a real-time phishing proxy that captures both the user's password and their MFA code, then replays them to the legitimate site. What is this technique called?",
        choices: [
          "Real-time phishing (adversary-in-the-middle)",
          "SIM swapping",
          "Brute force attack",
          "Rainbow table attack",
        ],
        correctAnswer: "Real-time phishing (adversary-in-the-middle)",
        explanation:
          "Adversary-in-the-middle (AitM) phishing proxies like Evilginx intercept credentials and MFA codes in real time, relaying them to the legitimate site before they expire. FIDO2 hardware keys are resistant to this attack because they bind authentication to the origin domain.",
      },
    ],
  },
  {
    topicName: "Multi-Factor Authentication",
    concept: "Possession-factor authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A smart card used for authentication is an example of which factor category?",
        choices: [
          "Something you have",
          "Something you know",
          "Something you are",
          "Somewhere you are",
        ],
        correctAnswer: "Something you have",
        explanation:
          "A smart card is a possession factor (something you have). It contains a cryptographic chip that stores private keys. Smart cards are often combined with a PIN (something you know) for two-factor authentication in government and enterprise environments.",
      },
    ],
  },
  {
    topicName: "Multi-Factor Authentication",
    concept: "WebAuthn standard",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is WebAuthn (Web Authentication)?",
        choices: [
          "A W3C standard that enables passwordless and MFA authentication in web browsers using public-key cryptography",
          "A protocol for encrypting web traffic between browsers and servers",
          "A web application firewall standard for blocking malicious requests",
          "A method for compressing authentication tokens to reduce bandwidth",
        ],
        correctAnswer:
          "A W3C standard that enables passwordless and MFA authentication in web browsers using public-key cryptography",
        explanation:
          "WebAuthn is the browser API component of the FIDO2 framework. It allows websites to register and authenticate users using public-key cryptography with platform authenticators (like fingerprint readers) or roaming authenticators (like security keys).",
      },
    ],
  },
  {
    topicName: "Multi-Factor Authentication",
    concept: "MFA enrollment best practices",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which practice is recommended when enrolling users in MFA for an organization?",
        choices: [
          "Require MFA enrollment during initial account setup and offer multiple authenticator options",
          "Allow users to opt out of MFA if they find it inconvenient",
          "Use only SMS-based codes since all employees have phones",
          "Store MFA shared secrets in a spreadsheet accessible to the IT team",
        ],
        correctAnswer:
          "Require MFA enrollment during initial account setup and offer multiple authenticator options",
        explanation:
          "Best practices include mandatory enrollment at onboarding, offering multiple authenticator types (app, hardware key, push) to accommodate different users, providing backup recovery codes, and requiring re-enrollment if a device is lost.",
      },
    ],
  },

  // ─── Privilege Management (12 nodes) ───

  {
    topicName: "Privilege Management",
    concept: "Least privilege principle",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An organization ensures that database administrators can only access the specific databases they manage rather than all databases. Which principle is being applied?",
        choices: [
          "Principle of least privilege",
          "Separation of duties",
          "Defense in depth",
          "Need to know",
        ],
        correctAnswer: "Principle of least privilege",
        explanation:
          "The principle of least privilege restricts users and processes to the minimum permissions necessary for their function. Granting DBAs access only to their specific databases limits the blast radius of a compromised account.",
      },
    ],
  },
  {
    topicName: "Privilege Management",
    concept: "Privilege escalation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "An attacker exploits a vulnerability to gain administrator access from a standard user account. What is this called?",
        choices: [
          "Privilege escalation",
          "Credential stuffing",
          "Session hijacking",
          "DNS spoofing",
        ],
        correctAnswer: "Privilege escalation",
        explanation:
          "Privilege escalation occurs when an attacker elevates their access level beyond what was originally granted. Vertical escalation gains higher privileges (user to admin), while horizontal escalation accesses another user's resources at the same level.",
      },
    ],
  },
  {
    topicName: "Privilege Management",
    concept: "Privileged Access Management (PAM)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of a Privileged Access Management (PAM) solution?",
        choices: [
          "To secure, manage, and monitor access to privileged accounts and credentials",
          "To provide single sign-on for end users accessing cloud applications",
          "To encrypt email communications between employees",
          "To scan the network for unpatched systems",
        ],
        correctAnswer:
          "To secure, manage, and monitor access to privileged accounts and credentials",
        explanation:
          "PAM solutions vault privileged credentials, enforce just-in-time access, record privileged sessions, and provide audit trails. They protect against credential theft and insider threats by controlling who can use powerful accounts and when.",
      },
    ],
  },
  {
    topicName: "Privilege Management",
    concept: "Just-in-time access",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does just-in-time (JIT) access mean in privilege management?",
        choices: [
          "Elevated privileges are granted only when needed and automatically revoked after a set time period",
          "Users are granted permanent access to all systems on their first day",
          "Access is only available during business hours and blocked at night",
          "Privileges are assigned based on the user's job title at hiring",
        ],
        correctAnswer:
          "Elevated privileges are granted only when needed and automatically revoked after a set time period",
        explanation:
          "Just-in-time access eliminates standing privileges by granting elevated access only for a specific task and duration. This reduces the window of opportunity for attackers to exploit privileged credentials and limits the impact of compromised accounts.",
      },
    ],
  },
  {
    topicName: "Privilege Management",
    concept: "Sudo and privilege elevation in Linux",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In Linux, what does the sudo command allow a user to do?",
        choices: [
          "Execute a command with elevated (typically root) privileges as defined by the sudoers configuration",
          "Switch to a different user's home directory",
          "Permanently grant root access to the user's account",
          "Encrypt a file using the system's root certificate",
        ],
        correctAnswer:
          "Execute a command with elevated (typically root) privileges as defined by the sudoers configuration",
        explanation:
          "sudo (superuser do) allows permitted users to run specific commands as root or another user as defined in /etc/sudoers. It provides granular control over who can run what commands, logs all usage, and avoids the need to share the root password.",
      },
    ],
  },
  {
    topicName: "Privilege Management",
    concept: "Credential vaulting",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of a credential vault in enterprise security?",
        choices: [
          "To securely store privileged credentials and rotate them automatically, preventing hardcoded or shared passwords",
          "To provide users with a simple password manager for personal accounts",
          "To encrypt all network traffic between servers",
          "To store encrypted backups of the organization's databases",
        ],
        correctAnswer:
          "To securely store privileged credentials and rotate them automatically, preventing hardcoded or shared passwords",
        explanation:
          "Credential vaults centrally store and manage privileged passwords, API keys, and certificates. They automate credential rotation, enforce checkout/check-in workflows, and provide audit trails. CyberArk, HashiCorp Vault, and Azure Key Vault are common solutions.",
      },
    ],
  },
  {
    topicName: "Privilege Management",
    concept: "Service account risks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why are service accounts considered a significant security risk in many organizations?",
        choices: [
          "They often have elevated privileges, static passwords, and are not subject to MFA or regular password rotation",
          "They are only used by human users and can be easily phished",
          "They automatically expire after 30 days and cause outages",
          "They are always publicly accessible from the internet",
        ],
        correctAnswer:
          "They often have elevated privileges, static passwords, and are not subject to MFA or regular password rotation",
        explanation:
          "Service accounts run automated processes and often hold broad privileges. They frequently have passwords that never change, are shared among teams, and cannot use interactive MFA. Attackers target them because compromising one can provide persistent, undetected access.",
      },
    ],
  },
  {
    topicName: "Privilege Management",
    concept: "Admin tiering model",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of an administrative tiering model (such as Microsoft's Enterprise Access Model)?",
        choices: [
          "To separate privileged access into isolated tiers so that a compromise of one tier does not automatically grant access to another",
          "To assign all administrators the same level of access for simplicity",
          "To allow helpdesk staff to reset domain admin passwords",
          "To enable service accounts to authenticate across all tiers with a single credential",
        ],
        correctAnswer:
          "To separate privileged access into isolated tiers so that a compromise of one tier does not automatically grant access to another",
        explanation:
          "Admin tiering (e.g., Tier 0 for domain controllers, Tier 1 for servers, Tier 2 for workstations) ensures that credentials used at one tier are never exposed to a lower tier. This prevents lateral movement from a compromised workstation to domain admin.",
      },
    ],
  },
  {
    topicName: "Privilege Management",
    concept: "Privilege creep",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is privilege creep?",
        choices: [
          "The gradual accumulation of access rights beyond what a user needs, often due to role changes without access review",
          "A type of malware that slowly escalates its own system privileges",
          "The process of an attacker moving laterally through a network",
          "An automated system that gradually increases password complexity requirements",
        ],
        correctAnswer:
          "The gradual accumulation of access rights beyond what a user needs, often due to role changes without access review",
        explanation:
          "Privilege creep occurs when users accumulate permissions over time as they change roles or take on new responsibilities, but old access is never revoked. Regular access reviews and role-based provisioning help prevent privilege creep.",
      },
    ],
  },
  {
    topicName: "Privilege Management",
    concept: "Break-glass accounts",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a break-glass (emergency access) account?",
        choices: [
          "A highly privileged account reserved for emergency use when normal administrative access is unavailable",
          "A temporary guest account provided to external auditors",
          "An account that is automatically created when a system detects a security breach",
          "A standard user account with no special privileges",
        ],
        correctAnswer:
          "A highly privileged account reserved for emergency use when normal administrative access is unavailable",
        explanation:
          "Break-glass accounts provide emergency access when standard privileged access methods fail (e.g., IdP outage, lockout). They should be highly secured with strong credentials, stored in a vault, monitored for any use, and their usage should trigger alerts and reviews.",
      },
    ],
  },
  {
    topicName: "Privilege Management",
    concept: "Session recording for privileged access",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why do PAM solutions often include session recording for privileged users?",
        choices: [
          "To provide a complete audit trail of privileged activities for forensics and compliance",
          "To allow administrators to share their screens with remote colleagues",
          "To compress and archive network traffic for storage efficiency",
          "To automatically fix any configuration errors made during the session",
        ],
        correctAnswer:
          "To provide a complete audit trail of privileged activities for forensics and compliance",
        explanation:
          "Session recording captures keystrokes, commands, and screen activity during privileged sessions. This provides a forensic audit trail for investigating incidents, supports compliance requirements, and deters insiders from abusing their access.",
      },
    ],
  },
  {
    topicName: "Privilege Management",
    concept: "Standing privileges vs. zero standing privileges",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does 'zero standing privileges' (ZSP) mean?",
        choices: [
          "No user has permanent privileged access; all elevated access must be requested and approved on demand",
          "All users start with full administrator access that is gradually reduced",
          "Privileged accounts have their passwords set to zero characters",
          "Users are never granted any privileges under any circumstances",
        ],
        correctAnswer:
          "No user has permanent privileged access; all elevated access must be requested and approved on demand",
        explanation:
          "Zero standing privileges eliminates always-on admin access. Users request elevated permissions through a workflow (often with approval and justification), receive time-limited access, and return to baseline when the task is complete. This minimizes the attack surface of privileged accounts.",
      },
    ],
  },

  // ─── Access Control Models (12 nodes) ───

  {
    topicName: "Access Control Models",
    concept: "Role-Based Access Control (RBAC)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In RBAC, what is used to determine a user's permissions?",
        choices: [
          "The roles assigned to the user, where each role carries a defined set of permissions",
          "The user's IP address and geographic location",
          "The security classification labels on data and the user's clearance level",
          "The user's biometric profile",
        ],
        correctAnswer:
          "The roles assigned to the user, where each role carries a defined set of permissions",
        explanation:
          "RBAC assigns permissions to roles (e.g., 'Analyst', 'Manager', 'Admin') and then assigns users to roles. This simplifies administration because changing a role's permissions automatically affects all users in that role.",
      },
    ],
  },
  {
    topicName: "Access Control Models",
    concept: "Attribute-Based Access Control (ABAC)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A policy states: 'Allow access to patient records only if the requester's department is Cardiology AND the patient's ward is Cardiology AND the time is during business hours.' Which access control model is this?",
        choices: [
          "Attribute-Based Access Control (ABAC)",
          "Role-Based Access Control (RBAC)",
          "Mandatory Access Control (MAC)",
          "Discretionary Access Control (DAC)",
        ],
        correctAnswer: "Attribute-Based Access Control (ABAC)",
        explanation:
          "ABAC evaluates access decisions using attributes of the subject, resource, action, and environment. This allows fine-grained, context-aware policies that go beyond what static roles can express, making it ideal for complex access requirements.",
      },
    ],
  },
  {
    topicName: "Access Control Models",
    concept: "Mandatory Access Control (MAC)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In a Mandatory Access Control system, who has the authority to change the access control policy?",
        choices: [
          "Only the system administrator or a central security authority, not the resource owner",
          "Any user who currently has access to the resource",
          "The resource owner or creator",
          "Any user in the same organizational unit as the resource",
        ],
        correctAnswer:
          "Only the system administrator or a central security authority, not the resource owner",
        explanation:
          "In MAC, access policies are enforced by the system based on security labels and can only be changed by administrators with the appropriate authority. Individual users cannot override or modify access controls on resources they own, unlike in DAC.",
      },
    ],
  },
  {
    topicName: "Access Control Models",
    concept: "Discretionary Access Control (DAC)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A user creates a shared folder and grants read access to specific colleagues. Which access control model does this represent?",
        choices: [
          "Discretionary Access Control (DAC)",
          "Mandatory Access Control (MAC)",
          "Role-Based Access Control (RBAC)",
          "Rule-Based Access Control",
        ],
        correctAnswer: "Discretionary Access Control (DAC)",
        explanation:
          "DAC allows resource owners to control who can access their resources. Standard file system permissions on Windows (NTFS ACLs) and Linux (chmod) are common examples. The key characteristic is that the owner has discretion over access.",
      },
    ],
  },
  {
    topicName: "Access Control Models",
    concept: "Bell-LaPadula model",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "The Bell-LaPadula security model enforces which primary property?",
        choices: [
          "No read up, no write down — protecting confidentiality",
          "No read down, no write up — protecting integrity",
          "All users have equal access to all resources",
          "Resources are only accessible during business hours",
        ],
        correctAnswer:
          "No read up, no write down — protecting confidentiality",
        explanation:
          "Bell-LaPadula is a formal model focused on confidentiality. The Simple Security Property (no read up) prevents users from reading data above their clearance. The *-Property (no write down) prevents users from writing data to a lower classification level.",
      },
    ],
  },
  {
    topicName: "Access Control Models",
    concept: "Biba integrity model",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "The Biba model is designed to protect which security property?",
        choices: [
          "Integrity",
          "Confidentiality",
          "Availability",
          "Non-repudiation",
        ],
        correctAnswer: "Integrity",
        explanation:
          "Biba is the integrity counterpart to Bell-LaPadula. Its rules (no read down, no write up) prevent data contamination by ensuring that users cannot read less trustworthy data or write to more trustworthy data, preserving information integrity.",
      },
    ],
  },
  {
    topicName: "Access Control Models",
    concept: "Access Control Lists (ACLs)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is an Access Control List (ACL) in the context of file system security?",
        choices: [
          "A list of permissions attached to a resource specifying which users or groups can perform which operations",
          "A list of all users who have logged into the system in the past month",
          "A list of blocked IP addresses maintained by a firewall",
          "A list of encryption keys used to protect files at rest",
        ],
        correctAnswer:
          "A list of permissions attached to a resource specifying which users or groups can perform which operations",
        explanation:
          "An ACL is attached to a resource (file, folder, network device) and lists the subjects (users, groups) and the operations they are permitted (read, write, execute) or denied. NTFS file permissions and router ACLs are common implementations.",
      },
    ],
  },
  {
    topicName: "Access Control Models",
    concept: "Rule-Based Access Control",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "A firewall that permits or denies traffic based on predefined rules about source IP, destination port, and protocol is an example of which access control approach?",
        choices: [
          "Rule-Based Access Control",
          "Role-Based Access Control (RBAC)",
          "Discretionary Access Control (DAC)",
          "Attribute-Based Access Control (ABAC)",
        ],
        correctAnswer: "Rule-Based Access Control",
        explanation:
          "Rule-based access control uses a set of administrator-defined rules (conditions and actions) to determine access. Firewalls and router ACLs are classic examples, evaluating each request against an ordered list of allow/deny rules.",
      },
    ],
  },
  {
    topicName: "Access Control Models",
    concept: "Clark-Wilson integrity model",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What mechanism does the Clark-Wilson model use to enforce data integrity?",
        choices: [
          "Well-formed transactions and separation of duties, ensuring data is only modified through approved procedures",
          "Security labels and clearance levels assigned by a central authority",
          "Resource owners setting permissions for individual users",
          "Time-based access rules that change throughout the day",
        ],
        correctAnswer:
          "Well-formed transactions and separation of duties, ensuring data is only modified through approved procedures",
        explanation:
          "Clark-Wilson focuses on commercial data integrity. It requires that data (Constrained Data Items) can only be modified by approved Transformation Procedures, and that separation of duties prevents any single user from controlling an entire critical process.",
      },
    ],
  },
  {
    topicName: "Access Control Models",
    concept: "Policy-Based Access Control (PBAC)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does Policy-Based Access Control (PBAC) make authorization decisions?",
        choices: [
          "By evaluating access requests against centrally managed policies that combine multiple conditions and rules",
          "By allowing each resource owner to set their own access rules",
          "By assigning all users to a single predefined role",
          "By requiring every access request to be manually approved by a security officer",
        ],
        correctAnswer:
          "By evaluating access requests against centrally managed policies that combine multiple conditions and rules",
        explanation:
          "PBAC uses centralized policies that can incorporate attributes, roles, rules, and context. XACML (eXtensible Access Control Markup Language) is a common standard for expressing PBAC policies. It provides flexibility while maintaining centralized governance.",
      },
    ],
  },
  {
    topicName: "Access Control Models",
    concept: "Implicit deny",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the 'implicit deny' principle mean in access control?",
        choices: [
          "Any access that is not explicitly permitted is automatically denied",
          "All access is denied by default and cannot be changed",
          "Denied access requests are hidden from the user",
          "Access denials are logged but not enforced",
        ],
        correctAnswer:
          "Any access that is not explicitly permitted is automatically denied",
        explanation:
          "Implicit deny (also called default deny) means that if no rule explicitly grants access, the request is denied. This is a fundamental security principle used in firewalls, access control lists, and authorization systems to ensure a secure default posture.",
      },
    ],
  },
  {
    topicName: "Access Control Models",
    concept: "Chinese Wall model (Brewer-Nash)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "The Brewer-Nash (Chinese Wall) model is primarily designed to prevent which type of problem?",
        choices: [
          "Conflicts of interest by restricting access to data from competing organizations",
          "Unauthorized physical access to data centers",
          "Denial-of-service attacks against web servers",
          "Data loss from hardware failures",
        ],
        correctAnswer:
          "Conflicts of interest by restricting access to data from competing organizations",
        explanation:
          "The Brewer-Nash model dynamically restricts access based on what data a user has previously accessed. Once a consultant views data from Company A, they are blocked from accessing data from Company A's competitor, preventing conflicts of interest.",
      },
    ],
  },

  // ─── Identity Governance (12 nodes) ───

  {
    topicName: "Identity Governance",
    concept: "Identity lifecycle management",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does identity lifecycle management encompass?",
        choices: [
          "The processes of creating, managing, and deactivating user identities throughout their relationship with an organization",
          "The physical lifecycle of hardware tokens from manufacturing to disposal",
          "The software development lifecycle of identity management applications",
          "The process of rotating encryption keys on a scheduled basis",
        ],
        correctAnswer:
          "The processes of creating, managing, and deactivating user identities throughout their relationship with an organization",
        explanation:
          "Identity lifecycle management covers joiner (onboarding with appropriate access), mover (adjusting access when roles change), and leaver (deprovisioning all access promptly) processes. Automation through identity governance tools reduces human error and orphaned accounts.",
      },
    ],
  },
  {
    topicName: "Identity Governance",
    concept: "Access certification reviews",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of periodic access certification (access review) campaigns?",
        choices: [
          "To verify that users still need the access they have been granted and remove unnecessary permissions",
          "To test whether the authentication system can handle peak login loads",
          "To renew SSL certificates before they expire",
          "To verify that backup systems are functioning correctly",
        ],
        correctAnswer:
          "To verify that users still need the access they have been granted and remove unnecessary permissions",
        explanation:
          "Access certification campaigns require managers or resource owners to review and confirm (certify) or revoke user access on a regular basis. This combats privilege creep, satisfies compliance requirements (SOX, HIPAA), and reduces the risk of unauthorized access.",
      },
    ],
  },
  {
    topicName: "Identity Governance",
    concept: "Segregation of duties (SoD)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In identity governance, a SoD policy prevents the same person from being able to both create purchase orders and approve payments. What does SoD stand for?",
        choices: [
          "Segregation of Duties",
          "Security of Data",
          "Standard of Deployment",
          "System of Detection",
        ],
        correctAnswer: "Segregation of Duties",
        explanation:
          "Segregation of Duties (SoD) ensures that critical business processes require multiple individuals, preventing fraud and errors. Identity governance tools can detect SoD violations automatically by analyzing role combinations and alerting when conflicts arise.",
      },
    ],
  },
  {
    topicName: "Identity Governance",
    concept: "Orphaned accounts",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is an orphaned account?",
        choices: [
          "An active account that is no longer associated with a current employee, often remaining after someone leaves the organization",
          "A newly created account that has not yet been assigned a password",
          "An account that has been locked out due to too many failed login attempts",
          "A shared account used by multiple team members",
        ],
        correctAnswer:
          "An active account that is no longer associated with a current employee, often remaining after someone leaves the organization",
        explanation:
          "Orphaned accounts are left behind when employees depart but their accounts are not disabled or deleted. They pose a significant security risk because they can be exploited by attackers or former employees. Automated deprovisioning prevents orphaned accounts.",
      },
    ],
  },
  {
    topicName: "Identity Governance",
    concept: "Role mining and role engineering",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is role mining in the context of identity governance?",
        choices: [
          "Analyzing existing user access patterns to discover and define appropriate roles for RBAC implementation",
          "Manually assigning permissions to each individual user account",
          "Scanning the network for unauthorized devices",
          "Encrypting role definitions in the directory service",
        ],
        correctAnswer:
          "Analyzing existing user access patterns to discover and define appropriate roles for RBAC implementation",
        explanation:
          "Role mining uses data analysis techniques to examine current access assignments and identify common permission groupings that can be formalized into roles. This bottom-up approach complements top-down role engineering, which designs roles from job functions.",
      },
    ],
  },
  {
    topicName: "Identity Governance",
    concept: "Joiner-mover-leaver process",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In the joiner-mover-leaver framework, what should happen when an employee transfers to a new department (mover)?",
        choices: [
          "Access from the old role should be revoked and new access appropriate for the new role should be granted",
          "The employee should keep all old access and receive additional access for the new role",
          "The employee's account should be deleted and recreated from scratch",
          "No changes are needed until the employee's next annual review",
        ],
        correctAnswer:
          "Access from the old role should be revoked and new access appropriate for the new role should be granted",
        explanation:
          "The mover process must both provision new access for the new role and deprovision old access that is no longer needed. Failing to revoke old access is a primary cause of privilege creep, where users accumulate excessive permissions over time.",
      },
    ],
  },
  {
    topicName: "Identity Governance",
    concept: "Entitlement management",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is entitlement management in identity governance?",
        choices: [
          "The process of defining, assigning, and auditing the specific access rights and permissions granted to users across systems",
          "The management of software license entitlements for cost optimization",
          "The process of encrypting sensitive data before storing it in a database",
          "The deployment of intrusion detection systems across the network",
        ],
        correctAnswer:
          "The process of defining, assigning, and auditing the specific access rights and permissions granted to users across systems",
        explanation:
          "Entitlement management provides visibility into who has access to what across all applications and systems. It enables organizations to define access packages, automate approval workflows, and audit entitlements for compliance with regulations like SOX and GDPR.",
      },
    ],
  },
  {
    topicName: "Identity Governance",
    concept: "Compliance and identity governance",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which regulation requires organizations to implement controls over financial reporting systems, often driving access certification and SoD policies?",
        choices: [
          "Sarbanes-Oxley Act (SOX)",
          "GDPR (General Data Protection Regulation)",
          "PCI DSS (Payment Card Industry Data Security Standard)",
          "FISMA (Federal Information Security Management Act)",
        ],
        correctAnswer: "Sarbanes-Oxley Act (SOX)",
        explanation:
          "SOX Section 404 requires internal controls over financial reporting, which includes ensuring appropriate access controls, segregation of duties, and regular access reviews for systems that process financial data. Identity governance tools help organizations demonstrate SOX compliance.",
      },
    ],
  },
  {
    topicName: "Identity Governance",
    concept: "Identity governance and administration (IGA) platforms",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary function of an Identity Governance and Administration (IGA) platform?",
        choices: [
          "To automate identity lifecycle management, access requests, certifications, and policy enforcement across the enterprise",
          "To provide endpoint detection and response for workstations",
          "To manage the organization's public-facing website content",
          "To monitor network bandwidth usage and optimize performance",
        ],
        correctAnswer:
          "To automate identity lifecycle management, access requests, certifications, and policy enforcement across the enterprise",
        explanation:
          "IGA platforms like SailPoint, Saviynt, and One Identity provide comprehensive identity governance by combining identity lifecycle management, access request workflows, certification campaigns, SoD enforcement, and audit reporting in a single solution.",
      },
    ],
  },
  {
    topicName: "Identity Governance",
    concept: "Self-service access requests",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the benefit of implementing self-service access request portals in identity governance?",
        choices: [
          "Users can request access through an automated workflow with appropriate approvals, reducing IT bottlenecks",
          "Users can grant themselves any access without approval",
          "Only IT administrators can request access on behalf of users",
          "Access is automatically granted to all resources upon request without review",
        ],
        correctAnswer:
          "Users can request access through an automated workflow with appropriate approvals, reducing IT bottlenecks",
        explanation:
          "Self-service portals allow users to browse an access catalog and submit requests. The system routes requests through automated approval workflows (manager approval, resource owner approval) and provisions access upon approval, improving speed while maintaining governance.",
      },
    ],
  },
  {
    topicName: "Identity Governance",
    concept: "Audit trails for identity changes",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why are audit trails essential for identity governance?",
        choices: [
          "They provide a documented record of who changed what access, when, and why, supporting forensics and compliance",
          "They speed up the authentication process for end users",
          "They encrypt user credentials during storage",
          "They automatically revoke access for terminated employees",
        ],
        correctAnswer:
          "They provide a documented record of who changed what access, when, and why, supporting forensics and compliance",
        explanation:
          "Audit trails record every identity-related change (account creation, permission changes, access revocation) with timestamps and the identity of the person who made the change. They are critical for incident investigation, compliance evidence, and accountability.",
      },
    ],
  },
  {
    topicName: "Identity Governance",
    concept: "Birthright access",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In identity governance, what is 'birthright access'?",
        choices: [
          "The baseline set of access rights automatically granted to a user when they join the organization based on their role",
          "Access that is inherited through a user's family relationship to another employee",
          "Emergency access granted during a security incident",
          "Access rights that can never be revoked once granted",
        ],
        correctAnswer:
          "The baseline set of access rights automatically granted to a user when they join the organization based on their role",
        explanation:
          "Birthright access is the default set of permissions provisioned automatically when a new user is onboarded, based on their department, job title, or role. Examples include email access, intranet access, and HR system access. Additional access is requested separately.",
      },
    ],
  },

  // ─── Zero Trust Identity (12 nodes) ───

  {
    topicName: "Zero Trust Identity",
    concept: "Zero Trust principles",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the core principle of a Zero Trust security model?",
        choices: [
          "Never trust, always verify — every access request must be authenticated and authorized regardless of network location",
          "Trust users inside the corporate network and verify only external users",
          "Trust all devices that have antivirus software installed",
          "Verify users only on their first login and trust them for subsequent sessions",
        ],
        correctAnswer:
          "Never trust, always verify — every access request must be authenticated and authorized regardless of network location",
        explanation:
          "Zero Trust eliminates implicit trust based on network location. Every access request — whether from inside or outside the network — must be verified based on identity, device health, and context before granting least-privilege access.",
      },
    ],
  },
  {
    topicName: "Zero Trust Identity",
    concept: "Identity as the new perimeter",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In a Zero Trust architecture, what has replaced the traditional network perimeter as the primary security boundary?",
        choices: [
          "Identity — user and device verification at every access point",
          "The firewall at the network edge",
          "The VPN concentrator",
          "Physical building access controls",
        ],
        correctAnswer:
          "Identity — user and device verification at every access point",
        explanation:
          "With cloud services, remote work, and mobile devices, the traditional network perimeter has dissolved. In Zero Trust, identity (who or what is requesting access) becomes the control plane, and every access decision is based on verifying that identity in context.",
      },
    ],
  },
  {
    topicName: "Zero Trust Identity",
    concept: "Continuous authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is continuous authentication in a Zero Trust context?",
        choices: [
          "Ongoing verification of a user's identity and risk level throughout a session, not just at login",
          "Requiring the user to enter their password every five minutes",
          "A one-time biometric scan that grants permanent access",
          "Authenticating only when the user accesses a new application",
        ],
        correctAnswer:
          "Ongoing verification of a user's identity and risk level throughout a session, not just at login",
        explanation:
          "Continuous authentication monitors behavioral signals (typing patterns, mouse movements, location changes) and risk indicators throughout a session. If anomalies are detected, the system can step up authentication requirements or terminate the session.",
      },
    ],
  },
  {
    topicName: "Zero Trust Identity",
    concept: "Device trust and posture assessment",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In Zero Trust, why is device posture assessment important before granting access?",
        choices: [
          "An authenticated user on a compromised or non-compliant device still poses a risk to organizational resources",
          "Device posture is only relevant for physical security, not digital access",
          "It is used to measure the physical condition of laptops for warranty purposes",
          "Device assessment is only needed for personal devices, not corporate ones",
        ],
        correctAnswer:
          "An authenticated user on a compromised or non-compliant device still poses a risk to organizational resources",
        explanation:
          "Zero Trust evaluates both identity and device health. Device posture checks verify that the device has up-to-date patches, active endpoint protection, disk encryption, and compliance with security policies before granting access to resources.",
      },
    ],
  },
  {
    topicName: "Zero Trust Identity",
    concept: "Micro-segmentation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does micro-segmentation support Zero Trust identity principles?",
        choices: [
          "By dividing the network into small, isolated segments so that authenticated users can only access the specific resources they are authorized for",
          "By creating a single large network segment for all users to simplify management",
          "By encrypting all data at rest on file servers",
          "By providing a single sign-on experience across all applications",
        ],
        correctAnswer:
          "By dividing the network into small, isolated segments so that authenticated users can only access the specific resources they are authorized for",
        explanation:
          "Micro-segmentation creates granular security zones around individual workloads or applications. Even after a user is authenticated, they can only reach the specific segments they are authorized for, limiting lateral movement in case of compromise.",
      },
    ],
  },
  {
    topicName: "Zero Trust Identity",
    concept: "Conditional access policies",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What do conditional access policies evaluate before granting access in a Zero Trust environment?",
        choices: [
          "Signals such as user identity, device compliance, location, and risk level to determine whether to grant, deny, or require additional verification",
          "Only the user's username and password",
          "Only whether the user is connected to the corporate VPN",
          "Only the time of day the access request is made",
        ],
        correctAnswer:
          "Signals such as user identity, device compliance, location, and risk level to determine whether to grant, deny, or require additional verification",
        explanation:
          "Conditional access policies (e.g., in Microsoft Entra ID) evaluate multiple signals: who is requesting access, from which device, from where, the sensitivity of the resource, and the current risk level. Based on these signals, the policy can allow, block, or require step-up MFA.",
      },
    ],
  },
  {
    topicName: "Zero Trust Identity",
    concept: "Software-defined perimeter (SDP)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary benefit of a Software-Defined Perimeter (SDP) in Zero Trust?",
        choices: [
          "Resources are invisible to unauthorized users because connections are only established after identity verification",
          "It replaces all firewalls with a single centralized appliance",
          "It allows all users to access all resources without authentication",
          "It provides faster internet speeds by bypassing traditional routing",
        ],
        correctAnswer:
          "Resources are invisible to unauthorized users because connections are only established after identity verification",
        explanation:
          "SDP implements a 'dark cloud' approach where all resources are hidden by default. Users must first authenticate and be authorized before a network connection to the resource is established. This eliminates the attack surface of exposed services.",
      },
    ],
  },
  {
    topicName: "Zero Trust Identity",
    concept: "Zero Trust Network Access (ZTNA)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does Zero Trust Network Access (ZTNA) differ from a traditional VPN?",
        choices: [
          "ZTNA grants access to specific applications based on identity and context, rather than providing broad network-level access",
          "ZTNA encrypts network traffic while VPN does not",
          "ZTNA requires physical proximity to the office, while VPN enables remote access",
          "ZTNA and VPN are different names for the same technology",
        ],
        correctAnswer:
          "ZTNA grants access to specific applications based on identity and context, rather than providing broad network-level access",
        explanation:
          "Traditional VPNs grant wide network access once connected, creating a large attack surface. ZTNA provides application-level access based on identity, device posture, and context, following the principle of least privilege and reducing lateral movement risk.",
      },
    ],
  },
  {
    topicName: "Zero Trust Identity",
    concept: "Least privilege in Zero Trust",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does Zero Trust enforce the principle of least privilege differently from traditional security models?",
        choices: [
          "Access is dynamically granted per-session based on real-time risk assessment rather than relying on static role assignments alone",
          "All users are given full access and then manually restricted after review",
          "Least privilege is only applied to external contractors, not employees",
          "Access is granted permanently after initial verification",
        ],
        correctAnswer:
          "Access is dynamically granted per-session based on real-time risk assessment rather than relying on static role assignments alone",
        explanation:
          "Zero Trust combines identity verification, device health, behavioral analytics, and contextual risk signals to dynamically determine the minimum access needed for each session. This goes beyond static RBAC by adapting access in real time.",
      },
    ],
  },
  {
    topicName: "Zero Trust Identity",
    concept: "Identity threat detection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does Identity Threat Detection and Response (ITDR) focus on?",
        choices: [
          "Detecting and responding to threats targeting identity infrastructure, such as credential theft and directory attacks",
          "Detecting physical threats to data center facilities",
          "Monitoring network bandwidth for performance optimization",
          "Scanning application code for security vulnerabilities",
        ],
        correctAnswer:
          "Detecting and responding to threats targeting identity infrastructure, such as credential theft and directory attacks",
        explanation:
          "ITDR is a security discipline focused on protecting identity systems (Active Directory, IdPs, MFA) from attack. It detects threats like Golden Ticket attacks, DCSync, MFA bypass attempts, and suspicious authentication patterns, and provides response capabilities.",
      },
    ],
  },
  {
    topicName: "Zero Trust Identity",
    concept: "Policy engine and policy enforcement point",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In NIST's Zero Trust Architecture, what is the role of the Policy Decision Point (PDP)?",
        choices: [
          "To evaluate access requests against defined policies and make grant or deny decisions",
          "To encrypt all network traffic between the user and the resource",
          "To store user credentials in an encrypted vault",
          "To physically separate network segments using routers",
        ],
        correctAnswer:
          "To evaluate access requests against defined policies and make grant or deny decisions",
        explanation:
          "The PDP (consisting of the Policy Engine and Policy Administrator) is the brain of Zero Trust. It evaluates each access request by considering identity, device posture, threat intelligence, and policies to make a trust decision. The Policy Enforcement Point (PEP) then enforces that decision.",
      },
    ],
  },
  {
    topicName: "Zero Trust Identity",
    concept: "Zero Trust maturity",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which of the following represents the most mature stage of Zero Trust identity implementation?",
        choices: [
          "Automated, risk-adaptive access decisions with continuous verification, machine learning-driven anomaly detection, and dynamic policy enforcement",
          "Basic password authentication with a firewall at the network perimeter",
          "MFA enabled only for VPN access",
          "Annual access reviews conducted manually with spreadsheets",
        ],
        correctAnswer:
          "Automated, risk-adaptive access decisions with continuous verification, machine learning-driven anomaly detection, and dynamic policy enforcement",
        explanation:
          "Zero Trust maturity progresses from traditional (perimeter-based), through initial (basic MFA, some segmentation), to advanced (automated policies, continuous verification), and optimal (fully automated, risk-adaptive, ML-driven) stages. CISA's Zero Trust Maturity Model defines these levels.",
      },
    ],
  },
];
