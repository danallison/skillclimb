import type { SeedDomain, SeedTopic, SeedNode } from "../../../seed/types.js";

export const domain: SeedDomain = {
  name: "Cryptography",
  tier: 1,
  description:
    "Symmetric and asymmetric encryption, hashing, PKI, TLS, and cryptanalysis fundamentals",
  prerequisites: [],
  displayOrder: 5,
};

export const topics: SeedTopic[] = [
  {
    name: "Cryptographic Foundations",
    complexityWeight: 1.0,
    displayOrder: 0,
  },
  {
    name: "Symmetric Encryption",
    complexityWeight: 1.2,
    displayOrder: 1,
  },
  {
    name: "Asymmetric Encryption",
    complexityWeight: 1.3,
    displayOrder: 2,
  },
  {
    name: "Hashing & Integrity",
    complexityWeight: 1.1,
    displayOrder: 3,
  },
  {
    name: "Digital Signatures & Certificates",
    complexityWeight: 1.3,
    displayOrder: 4,
  },
  {
    name: "PKI & TLS",
    complexityWeight: 1.4,
    displayOrder: 5,
  },
  {
    name: "Key Management",
    complexityWeight: 1.2,
    displayOrder: 6,
  },
  {
    name: "Cryptanalysis Basics",
    complexityWeight: 1.5,
    displayOrder: 7,
  },
];

export const nodes: SeedNode[] = [
  // ─── Cryptographic Foundations (13 nodes) ───

  {
    topicName: "Cryptographic Foundations",
    concept: "Plaintext and ciphertext",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In cryptography, what is the term for the readable, unencrypted form of a message?",
        choices: [
          "Plaintext",
          "Ciphertext",
          "Keystream",
          "Digest",
        ],
        correctAnswer: "Plaintext",
        explanation:
          "Plaintext is the original, readable message before encryption. Ciphertext is the scrambled, unreadable output after encryption. The goal of encryption is to transform plaintext into ciphertext that cannot be understood without the correct key.",
      },
      {
        type: "cued_recall",
        prompt:
          "What is the term for the unreadable, scrambled output produced after encrypting a message?",
        correctAnswer: "Ciphertext",
        acceptableAnswers: ["cipher text", "cipher-text", "encrypted text"],
        hints: [
          "It is the opposite of plaintext.",
          "The term starts with 'cipher'.",
        ],
        explanation:
          "Plaintext is the original, readable message before encryption. Ciphertext is the scrambled, unreadable output after encryption. The goal of encryption is to transform plaintext into ciphertext that cannot be understood without the correct key.",
      },
      {
        type: "free_recall",
        prompt:
          "Explain the relationship between plaintext, ciphertext, and encryption keys. How do these three concepts work together?",
        correctAnswer:
          "Plaintext is the original readable message. An encryption algorithm uses an encryption key to transform plaintext into ciphertext, which is unreadable and scrambled. To reverse the process, a decryption key is used to convert ciphertext back into plaintext. Without the correct key, the ciphertext should be computationally infeasible to convert back to plaintext.",
        rubric:
          "A good answer should define plaintext and ciphertext, explain the role of the key in both encryption and decryption, and convey that security depends on key secrecy.",
        keyPoints: [
          "Plaintext is the original readable data before encryption",
          "Ciphertext is the scrambled, unreadable output after encryption",
          "An encryption key is required to transform plaintext into ciphertext",
          "A decryption key is required to reverse ciphertext back to plaintext",
          "Without the correct key, ciphertext should be infeasible to decrypt",
        ],
        hints: [
          "Think about what goes in and what comes out of the encryption process.",
          "Consider what role the key plays in both directions.",
        ],
        explanation:
          "Plaintext is the original, readable message before encryption. Ciphertext is the scrambled, unreadable output after encryption. The goal of encryption is to transform plaintext into ciphertext that cannot be understood without the correct key.",
      },
    ],
  },
  {
    topicName: "Cryptographic Foundations",
    concept: "Encryption vs. encoding",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the key difference between encryption and encoding?",
        choices: [
          "Encryption requires a secret key to reverse; encoding does not",
          "Encoding requires a secret key to reverse; encryption does not",
          "Encryption and encoding are the same process",
          "Encoding provides confidentiality; encryption provides formatting",
        ],
        correctAnswer:
          "Encryption requires a secret key to reverse; encoding does not",
        explanation:
          "Encoding (e.g., Base64, URL encoding) transforms data into a different format for compatibility or transport and is freely reversible. Encryption transforms data to protect confidentiality and requires a secret key to reverse. Encoding provides no security.",
      },
      {
        type: "cued_recall",
        prompt:
          "Does Base64 provide confidentiality? Why or why not?",
        correctAnswer:
          "No, Base64 is encoding, not encryption. It is freely reversible without any secret key.",
        acceptableAnswers: [
          "No, Base64 is encoding not encryption",
          "No, it is just encoding",
          "No, anyone can decode Base64 without a key",
        ],
        hints: [
          "Think about whether a secret key is needed to reverse Base64.",
          "Consider whether Base64 was designed for security or data formatting.",
        ],
        explanation:
          "Encoding (e.g., Base64, URL encoding) transforms data into a different format for compatibility or transport and is freely reversible. Encryption transforms data to protect confidentiality and requires a secret key to reverse. Encoding provides no security.",
      },
      {
        type: "free_recall",
        prompt:
          "Compare and contrast encryption and encoding. Explain their purposes, how they differ in reversibility, and give an example of each.",
        correctAnswer:
          "Encryption transforms data to protect confidentiality and requires a secret key to reverse. Examples include AES and RSA. Encoding transforms data into a different format for compatibility or transport purposes and is freely reversible by anyone without a secret. Examples include Base64 and URL encoding. The critical distinction is that encryption provides security through key-based confidentiality, while encoding provides no security at all.",
        rubric:
          "A good answer should clearly distinguish the purpose of each (confidentiality vs. formatting), explain that encryption requires a key to reverse while encoding does not, and provide at least one concrete example of each.",
        keyPoints: [
          "Encryption is designed to provide confidentiality",
          "Encoding is designed for data format compatibility or transport",
          "Encryption requires a secret key to reverse",
          "Encoding is freely reversible without any secret",
          "Common encoding examples: Base64, URL encoding; common encryption examples: AES, RSA",
        ],
        hints: [
          "Think about who can reverse each process — anyone, or only someone with a key?",
          "Consider the original purpose each was designed to serve.",
        ],
        explanation:
          "Encoding (e.g., Base64, URL encoding) transforms data into a different format for compatibility or transport and is freely reversible. Encryption transforms data to protect confidentiality and requires a secret key to reverse. Encoding provides no security.",
      },
    ],
  },
  {
    topicName: "Cryptographic Foundations",
    concept: "Kerckhoffs's principle",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does Kerckhoffs's principle state about a cryptographic system?",
        choices: [
          "The system should remain secure even if everything about it, except the key, is public knowledge",
          "The algorithm must be kept secret for the system to be secure",
          "Longer keys always guarantee stronger security",
          "Only symmetric algorithms can satisfy this principle",
        ],
        correctAnswer:
          "The system should remain secure even if everything about it, except the key, is public knowledge",
        explanation:
          "Kerckhoffs's principle holds that a cryptosystem's security should depend solely on the secrecy of the key, not on the secrecy of the algorithm. This is why modern algorithms like AES and RSA are publicly documented and extensively peer-reviewed.",
      },
      {
        type: "cued_recall",
        prompt:
          "According to Kerckhoffs's principle, what is the only thing that needs to remain secret for a cryptosystem to be secure?",
        correctAnswer: "The key",
        acceptableAnswers: [
          "the secret key",
          "the encryption key",
          "key",
          "the cryptographic key",
        ],
        hints: [
          "The principle says the algorithm itself can be public.",
          "Think about what the attacker should NOT be able to obtain.",
        ],
        explanation:
          "Kerckhoffs's principle holds that a cryptosystem's security should depend solely on the secrecy of the key, not on the secrecy of the algorithm. This is why modern algorithms like AES and RSA are publicly documented and extensively peer-reviewed.",
      },
      {
        type: "free_recall",
        prompt:
          "Explain Kerckhoffs's principle and why it is important for modern cryptographic design. How does it relate to the design of algorithms like AES?",
        correctAnswer:
          "Kerckhoffs's principle states that a cryptographic system should remain secure even if everything about the system, except the key, is publicly known. This means security should depend on the secrecy of the key, not the secrecy of the algorithm. This principle is fundamental to modern cryptography because it encourages open peer review of algorithms. AES, for example, is a publicly documented algorithm that has been extensively analyzed by researchers worldwide. Its security relies entirely on the secrecy and strength of the key, not on obscuring how the algorithm works.",
        rubric:
          "A good answer should state the principle clearly, explain why relying on algorithm secrecy is weak, and connect it to real-world open algorithm design such as AES.",
        keyPoints: [
          "Security should depend solely on key secrecy, not algorithm secrecy",
          "The algorithm can and should be publicly known",
          "Public algorithms benefit from peer review and analysis",
          "Security through obscurity (hiding the algorithm) is considered weak",
          "AES and RSA are examples of publicly documented, peer-reviewed algorithms",
        ],
        hints: [
          "Think about what happens when a secret algorithm is eventually reverse-engineered.",
          "Consider why open peer review strengthens cryptographic algorithms.",
        ],
        explanation:
          "Kerckhoffs's principle holds that a cryptosystem's security should depend solely on the secrecy of the key, not on the secrecy of the algorithm. This is why modern algorithms like AES and RSA are publicly documented and extensively peer-reviewed.",
      },
    ],
  },
  {
    topicName: "Cryptographic Foundations",
    concept: "Symmetric vs. asymmetric encryption overview",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the fundamental difference between symmetric and asymmetric encryption?",
        choices: [
          "Symmetric uses one shared key; asymmetric uses a public/private key pair",
          "Symmetric uses two keys; asymmetric uses one key",
          "Symmetric is slower than asymmetric",
          "Asymmetric cannot be used for confidentiality",
        ],
        correctAnswer:
          "Symmetric uses one shared key; asymmetric uses a public/private key pair",
        explanation:
          "Symmetric encryption uses a single secret key shared between parties for both encryption and decryption. Asymmetric encryption uses a mathematically related key pair: a public key (shared openly) and a private key (kept secret). Each approach has distinct trade-offs in speed and key management.",
      },
      {
        type: "cued_recall",
        prompt:
          "In asymmetric encryption, how many keys are involved and what are they called?",
        correctAnswer:
          "Two keys: a public key and a private key",
        acceptableAnswers: [
          "2 keys: public key and private key",
          "a public key and a private key",
          "two: public and private",
          "public/private key pair",
        ],
        hints: [
          "One of the keys is shared openly with anyone.",
          "The other key must be kept secret by the owner.",
        ],
        explanation:
          "Symmetric encryption uses a single secret key shared between parties for both encryption and decryption. Asymmetric encryption uses a mathematically related key pair: a public key (shared openly) and a private key (kept secret). Each approach has distinct trade-offs in speed and key management.",
      },
      {
        type: "free_recall",
        prompt:
          "Compare symmetric and asymmetric encryption. Discuss how many keys each uses, their relative speed, and the key distribution challenge each faces.",
        correctAnswer:
          "Symmetric encryption uses a single shared secret key for both encryption and decryption. It is fast and efficient for bulk data encryption, but the key distribution problem is significant: both parties must securely share the same secret key. Asymmetric encryption uses a pair of mathematically related keys — a public key and a private key. It solves the key distribution problem because the public key can be shared openly, but it is much slower than symmetric encryption. In practice, the two are often combined in hybrid schemes: asymmetric encryption secures the exchange of a symmetric session key, which then encrypts the actual data.",
        rubric:
          "A good answer should cover the number of keys for each type, address speed differences, explain the key distribution challenge, and ideally mention hybrid approaches.",
        keyPoints: [
          "Symmetric uses one shared secret key for both encryption and decryption",
          "Asymmetric uses a public/private key pair",
          "Symmetric encryption is significantly faster than asymmetric",
          "Symmetric encryption has a key distribution problem — both parties need the same secret key",
          "Asymmetric encryption solves key distribution but is slower; hybrid schemes combine both",
        ],
        hints: [
          "Think about what happens when two strangers need to communicate securely — how do they share a secret key?",
          "Consider why protocols like TLS use both types of encryption.",
        ],
        explanation:
          "Symmetric encryption uses a single secret key shared between parties for both encryption and decryption. Asymmetric encryption uses a mathematically related key pair: a public key (shared openly) and a private key (kept secret). Each approach has distinct trade-offs in speed and key management.",
      },
    ],
  },
  {
    topicName: "Cryptographic Foundations",
    concept: "Cryptographic randomness",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is a cryptographically secure pseudorandom number generator (CSPRNG) essential for key generation?",
        choices: [
          "Predictable random numbers allow attackers to guess keys",
          "CSPRNGs produce shorter keys that are easier to store",
          "Regular random number generators are too slow for key generation",
          "CSPRNGs are only needed for hashing, not encryption",
        ],
        correctAnswer:
          "Predictable random numbers allow attackers to guess keys",
        explanation:
          "If an attacker can predict the random number generator's output, they can reproduce the generated key. CSPRNGs like /dev/urandom on Linux or CryptGenRandom on Windows are designed to produce output that is computationally indistinguishable from true randomness.",
      },
      {
        type: "cued_recall",
        prompt:
          "What does CSPRNG stand for?",
        correctAnswer:
          "Cryptographically Secure Pseudorandom Number Generator",
        acceptableAnswers: [
          "cryptographically secure pseudo-random number generator",
          "cryptographically secure PRNG",
        ],
        hints: [
          "The 'CS' stands for a type of security guarantee.",
          "The 'PRNG' part refers to a pseudorandom number generator.",
        ],
        explanation:
          "If an attacker can predict the random number generator's output, they can reproduce the generated key. CSPRNGs like /dev/urandom on Linux or CryptGenRandom on Windows are designed to produce output that is computationally indistinguishable from true randomness.",
      },
      {
        type: "free_recall",
        prompt:
          "Explain why cryptographic randomness is critical for key generation and what can go wrong if a weak random number generator is used. Include an example of a CSPRNG.",
        correctAnswer:
          "Cryptographic key generation requires unpredictable random numbers. If a weak or predictable random number generator is used, an attacker who knows or can guess the generator's internal state can reproduce the generated keys and break the encryption entirely. A CSPRNG (Cryptographically Secure Pseudorandom Number Generator) is designed so that its output is computationally indistinguishable from true randomness, meaning even an attacker who sees previous outputs cannot predict future ones. Examples include /dev/urandom on Linux and CryptGenRandom on Windows. Real-world failures like the Debian OpenSSL bug (2008) demonstrate the catastrophic consequences of weak randomness.",
        rubric:
          "A good answer should explain why unpredictability matters for key generation, describe what happens when randomness is weak, define what a CSPRNG provides, and ideally give an example of a CSPRNG or a real-world randomness failure.",
        keyPoints: [
          "Keys must be generated from unpredictable random sources",
          "Predictable randomness lets attackers reproduce generated keys",
          "A CSPRNG produces output computationally indistinguishable from true randomness",
          "Examples of CSPRNGs: /dev/urandom (Linux), CryptGenRandom (Windows)",
          "Historical failures (e.g., Debian OpenSSL bug) show real-world impact of weak randomness",
        ],
        hints: [
          "Think about what an attacker could do if they could predict the output of the random number generator.",
          "Consider what properties a random number generator needs to be safe for cryptographic use.",
        ],
        explanation:
          "If an attacker can predict the random number generator's output, they can reproduce the generated key. CSPRNGs like /dev/urandom on Linux or CryptGenRandom on Windows are designed to produce output that is computationally indistinguishable from true randomness.",
      },
    ],
  },
  {
    topicName: "Cryptographic Foundations",
    concept: "Key length and security strength",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does increasing the key length of a symmetric cipher generally affect security?",
        choices: [
          "It exponentially increases the number of possible keys an attacker must try",
          "It linearly increases the number of possible keys",
          "It has no effect on brute-force resistance",
          "It decreases security because longer keys are more likely to be leaked",
        ],
        correctAnswer:
          "It exponentially increases the number of possible keys an attacker must try",
        explanation:
          "Each additional bit doubles the number of possible keys. A 128-bit key has 2^128 possible values, while a 256-bit key has 2^256 — an astronomically larger keyspace. This exponential growth makes brute-force attacks infeasible for sufficiently long keys.",
      },
    ],
  },
  {
    topicName: "Cryptographic Foundations",
    concept: "Block ciphers vs. stream ciphers",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary difference between a block cipher and a stream cipher?",
        choices: [
          "A block cipher encrypts fixed-size blocks of data; a stream cipher encrypts data one bit or byte at a time",
          "A stream cipher encrypts fixed-size blocks; a block cipher encrypts bit by bit",
          "Block ciphers are always asymmetric; stream ciphers are always symmetric",
          "Stream ciphers are slower than block ciphers in all scenarios",
        ],
        correctAnswer:
          "A block cipher encrypts fixed-size blocks of data; a stream cipher encrypts data one bit or byte at a time",
        explanation:
          "Block ciphers like AES process data in fixed-size chunks (e.g., 128 bits). Stream ciphers like ChaCha20 generate a keystream and encrypt data continuously, one bit or byte at a time. Stream ciphers are often preferred for real-time or streaming data.",
      },
    ],
  },
  {
    topicName: "Cryptographic Foundations",
    concept: "XOR operation in cryptography",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is the XOR (exclusive or) operation fundamental to many encryption algorithms?",
        choices: [
          "It is its own inverse — applying XOR twice with the same key restores the original data",
          "It permanently destroys data, making it unrecoverable",
          "It compresses data before encryption",
          "It only works with asymmetric key pairs",
        ],
        correctAnswer:
          "It is its own inverse — applying XOR twice with the same key restores the original data",
        explanation:
          "XOR is self-inverting: (plaintext XOR key) XOR key = plaintext. This property makes it ideal for encryption and decryption using the same operation. The one-time pad, the only theoretically unbreakable cipher, relies entirely on XOR with a truly random key.",
      },
    ],
  },
  {
    topicName: "Cryptographic Foundations",
    concept: "One-time pad",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What makes the one-time pad theoretically unbreakable?",
        choices: [
          "The key is truly random, at least as long as the message, and never reused",
          "It uses the strongest available block cipher algorithm",
          "It relies on the computational difficulty of factoring large primes",
          "It encrypts data multiple times with different algorithms",
        ],
        correctAnswer:
          "The key is truly random, at least as long as the message, and never reused",
        explanation:
          "A one-time pad achieves perfect secrecy (proven by Claude Shannon) because each bit of plaintext is XORed with a truly random key bit that is never reused. The impracticality of distributing and managing such keys limits its real-world use.",
      },
    ],
  },
  {
    topicName: "Cryptographic Foundations",
    concept: "Confusion and diffusion",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In Shannon's theory, what does 'diffusion' accomplish in a cipher?",
        choices: [
          "It spreads the influence of each plaintext bit across many ciphertext bits",
          "It makes the relationship between the key and ciphertext as complex as possible",
          "It compresses the plaintext before encryption",
          "It generates the encryption key from a password",
        ],
        correctAnswer:
          "It spreads the influence of each plaintext bit across many ciphertext bits",
        explanation:
          "Diffusion ensures that changing a single plaintext bit affects many ciphertext bits, obscuring statistical patterns. Confusion makes the relationship between the key and ciphertext complex. Together, these properties form the theoretical basis for strong cipher design.",
      },
    ],
  },
  {
    topicName: "Cryptographic Foundations",
    concept: "Initialization vector (IV)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of an initialization vector (IV) in encryption?",
        choices: [
          "To ensure that encrypting the same plaintext with the same key produces different ciphertext each time",
          "To replace the encryption key after each session",
          "To compress the plaintext before encryption",
          "To authenticate the identity of the sender",
        ],
        correctAnswer:
          "To ensure that encrypting the same plaintext with the same key produces different ciphertext each time",
        explanation:
          "An IV introduces randomness into the encryption process so that identical plaintext blocks do not produce identical ciphertext blocks. The IV does not need to be secret but must be unpredictable (for CBC mode) or unique (for CTR/GCM modes).",
      },
    ],
  },
  {
    topicName: "Cryptographic Foundations",
    concept: "Cryptographic primitives",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which of the following is considered a cryptographic primitive?",
        choices: [
          "A hash function",
          "A firewall rule",
          "An intrusion detection system",
          "A VPN client application",
        ],
        correctAnswer: "A hash function",
        explanation:
          "Cryptographic primitives are the fundamental building blocks of cryptographic systems: hash functions, symmetric ciphers, asymmetric ciphers, and random number generators. Higher-level protocols like TLS are constructed by combining these primitives.",
      },
    ],
  },
  {
    topicName: "Cryptographic Foundations",
    concept: "Security through obscurity",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is 'security through obscurity' considered a poor primary defense strategy?",
        choices: [
          "Once the hidden mechanism is discovered, the entire system is compromised",
          "It requires too much computational power",
          "It is prohibited by international law",
          "It only works with symmetric encryption",
        ],
        correctAnswer:
          "Once the hidden mechanism is discovered, the entire system is compromised",
        explanation:
          "Security through obscurity relies on keeping the design or implementation secret rather than on mathematically sound principles. If an attacker reverse-engineers or discovers the hidden mechanism, no security remains. Robust cryptographic security depends on key secrecy, not algorithm secrecy.",
      },
    ],
  },

  // ─── Symmetric Encryption (13 nodes) ───

  {
    topicName: "Symmetric Encryption",
    concept: "AES (Advanced Encryption Standard)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which symmetric encryption algorithm was selected by NIST in 2001 as the replacement for DES?",
        choices: [
          "AES (Rijndael)",
          "Blowfish",
          "RC4",
          "IDEA",
        ],
        correctAnswer: "AES (Rijndael)",
        explanation:
          "AES (originally named Rijndael) was selected by NIST through a public competition as the Advanced Encryption Standard. It supports key sizes of 128, 192, and 256 bits and operates on 128-bit blocks. AES is the most widely used symmetric cipher today.",
      },
    ],
  },
  {
    topicName: "Symmetric Encryption",
    concept: "DES and 3DES",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is the original Data Encryption Standard (DES) considered insecure for modern use?",
        choices: [
          "Its 56-bit key length is too short to resist brute-force attacks with modern hardware",
          "Its algorithm has never been publicly reviewed",
          "It uses asymmetric key pairs that are easily factored",
          "It cannot encrypt data larger than 8 bytes",
        ],
        correctAnswer:
          "Its 56-bit key length is too short to resist brute-force attacks with modern hardware",
        explanation:
          "DES uses a 56-bit key, which provides only 2^56 possible keys. In 1999, a DES key was brute-forced in under 24 hours. Triple DES (3DES) applies DES three times with different keys to increase effective key length, but it is slow and being phased out in favor of AES.",
      },
    ],
  },
  {
    topicName: "Symmetric Encryption",
    concept: "AES key sizes",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which of the following is NOT a valid key size for AES?",
        choices: [
          "512 bits",
          "128 bits",
          "192 bits",
          "256 bits",
        ],
        correctAnswer: "512 bits",
        explanation:
          "AES supports exactly three key sizes: 128, 192, and 256 bits. The number of encryption rounds varies with key size: 10 rounds for 128-bit, 12 for 192-bit, and 14 for 256-bit. There is no 512-bit AES.",
      },
    ],
  },
  {
    topicName: "Symmetric Encryption",
    concept: "ECB mode vulnerability",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is Electronic Codebook (ECB) mode considered insecure for encrypting large amounts of data?",
        choices: [
          "Identical plaintext blocks produce identical ciphertext blocks, revealing patterns",
          "It requires an asymmetric key pair",
          "It does not use a block cipher at all",
          "It is too slow for any practical use",
        ],
        correctAnswer:
          "Identical plaintext blocks produce identical ciphertext blocks, revealing patterns",
        explanation:
          "ECB mode encrypts each block independently with the same key, so identical input blocks always produce identical output blocks. This leaks structural information about the plaintext, as famously demonstrated by the ECB penguin image example.",
      },
    ],
  },
  {
    topicName: "Symmetric Encryption",
    concept: "CBC mode",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In Cipher Block Chaining (CBC) mode, what is XORed with each plaintext block before encryption?",
        choices: [
          "The previous ciphertext block (or the IV for the first block)",
          "The encryption key",
          "The next plaintext block",
          "A random number generated for each block",
        ],
        correctAnswer:
          "The previous ciphertext block (or the IV for the first block)",
        explanation:
          "CBC mode chains blocks together by XORing each plaintext block with the previous ciphertext block before encrypting it. The first block is XORed with an initialization vector (IV). This ensures that identical plaintext blocks produce different ciphertext.",
      },
    ],
  },
  {
    topicName: "Symmetric Encryption",
    concept: "GCM mode (Galois/Counter Mode)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What advantage does AES-GCM provide over AES-CBC?",
        choices: [
          "It provides both encryption and built-in authentication (AEAD) in a single operation",
          "It uses a shorter key length for better performance",
          "It eliminates the need for an initialization vector",
          "It is a stream cipher rather than a block cipher",
        ],
        correctAnswer:
          "It provides both encryption and built-in authentication (AEAD) in a single operation",
        explanation:
          "AES-GCM is an Authenticated Encryption with Associated Data (AEAD) mode that provides both confidentiality and integrity/authenticity. It produces a ciphertext and an authentication tag, eliminating the need for a separate HMAC. It is the preferred mode in TLS 1.3.",
      },
    ],
  },
  {
    topicName: "Symmetric Encryption",
    concept: "CTR mode (Counter mode)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does Counter (CTR) mode turn a block cipher into a stream cipher?",
        choices: [
          "It encrypts successive counter values to generate a keystream that is XORed with plaintext",
          "It chains ciphertext blocks together using feedback",
          "It encrypts each block independently like ECB mode",
          "It hashes the plaintext before encrypting each block",
        ],
        correctAnswer:
          "It encrypts successive counter values to generate a keystream that is XORed with plaintext",
        explanation:
          "CTR mode encrypts a nonce concatenated with a counter value to produce a keystream block. This keystream is XORed with the plaintext to produce ciphertext. Because blocks are processed independently, CTR mode supports parallel encryption and random access.",
      },
    ],
  },
  {
    topicName: "Symmetric Encryption",
    concept: "ChaCha20",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "ChaCha20 is best described as which type of cryptographic algorithm?",
        choices: [
          "A symmetric stream cipher",
          "An asymmetric encryption algorithm",
          "A cryptographic hash function",
          "A key exchange protocol",
        ],
        correctAnswer: "A symmetric stream cipher",
        explanation:
          "ChaCha20, designed by Daniel Bernstein, is a high-speed symmetric stream cipher. It is widely used as an alternative to AES in TLS (especially on devices without AES hardware acceleration) and is paired with Poly1305 for authenticated encryption.",
      },
    ],
  },
  {
    topicName: "Symmetric Encryption",
    concept: "Key distribution problem",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the fundamental challenge of symmetric encryption that asymmetric encryption was designed to solve?",
        choices: [
          "Securely sharing the secret key between parties who have not previously communicated",
          "Encrypting data faster than asymmetric algorithms",
          "Producing shorter ciphertext than the original plaintext",
          "Generating digital signatures for email authentication",
        ],
        correctAnswer:
          "Securely sharing the secret key between parties who have not previously communicated",
        explanation:
          "Symmetric encryption requires both parties to possess the same secret key. Distributing that key securely over an insecure channel is known as the key distribution problem. Asymmetric encryption and protocols like Diffie-Hellman were developed to solve this challenge.",
      },
    ],
  },
  {
    topicName: "Symmetric Encryption",
    concept: "Blowfish and Twofish",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which of the following statements about Blowfish is correct?",
        choices: [
          "It is a symmetric block cipher with a variable key length up to 448 bits",
          "It is an asymmetric algorithm based on elliptic curves",
          "It was selected as the AES standard by NIST",
          "It is a cryptographic hash function used in TLS",
        ],
        correctAnswer:
          "It is a symmetric block cipher with a variable key length up to 448 bits",
        explanation:
          "Blowfish, designed by Bruce Schneier, is a symmetric block cipher that operates on 64-bit blocks and supports variable key lengths from 32 to 448 bits. Its successor Twofish was an AES finalist. Blowfish's 64-bit block size makes it unsuitable for encrypting large data volumes due to birthday bound concerns.",
      },
    ],
  },
  {
    topicName: "Symmetric Encryption",
    concept: "Padding in block ciphers",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is padding required when using a block cipher in CBC mode?",
        choices: [
          "The plaintext must be extended to fill complete blocks when it is not an exact multiple of the block size",
          "Padding adds the encryption key to the end of the message",
          "Padding compresses the plaintext to fit within one block",
          "Padding is only used in stream ciphers, not block ciphers",
        ],
        correctAnswer:
          "The plaintext must be extended to fill complete blocks when it is not an exact multiple of the block size",
        explanation:
          "Block ciphers in modes like CBC require input that is an exact multiple of the block size (e.g., 128 bits for AES). Padding schemes like PKCS#7 add bytes to fill the last block. Improper padding validation can lead to padding oracle attacks.",
      },
    ],
  },
  {
    topicName: "Symmetric Encryption",
    concept: "Authenticated encryption (AEAD)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does Authenticated Encryption with Associated Data (AEAD) provide that traditional encryption alone does not?",
        choices: [
          "Both confidentiality and integrity/authenticity verification in a single operation",
          "Faster encryption speed by eliminating the key schedule",
          "The ability to use asymmetric keys for block cipher encryption",
          "Compression of the plaintext before encryption",
        ],
        correctAnswer:
          "Both confidentiality and integrity/authenticity verification in a single operation",
        explanation:
          "AEAD combines encryption and authentication into one algorithm, producing both ciphertext and an authentication tag. This prevents attacks where ciphertext is modified undetected. AES-GCM and ChaCha20-Poly1305 are the most widely deployed AEAD constructions.",
      },
    ],
  },
  {
    topicName: "Symmetric Encryption",
    concept: "RC4 deprecation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why has the RC4 stream cipher been prohibited in TLS and deprecated by RFC 7465?",
        choices: [
          "Statistical biases in its keystream allow practical attacks that recover plaintext",
          "It is too slow for network traffic encryption",
          "It requires keys longer than 2048 bits",
          "It was never widely adopted in any protocol",
        ],
        correctAnswer:
          "Statistical biases in its keystream allow practical attacks that recover plaintext",
        explanation:
          "RC4 produces a keystream with measurable statistical biases, especially in the initial bytes. Researchers demonstrated practical attacks exploiting these biases to recover TLS session cookies. RFC 7465 (2015) prohibits RC4 in all versions of TLS.",
      },
    ],
  },

  // ─── Asymmetric Encryption (13 nodes) ───

  {
    topicName: "Asymmetric Encryption",
    concept: "RSA algorithm",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "The security of the RSA algorithm is based on the computational difficulty of which mathematical problem?",
        choices: [
          "Factoring the product of two large prime numbers",
          "Computing discrete logarithms in a finite field",
          "Solving the knapsack problem",
          "Finding collisions in hash functions",
        ],
        correctAnswer:
          "Factoring the product of two large prime numbers",
        explanation:
          "RSA generates keys by multiplying two large primes to create a modulus. Encrypting and decrypting depend on the relationship between these primes. Factoring the modulus back into its prime components is computationally infeasible for sufficiently large keys (2048+ bits).",
      },
    ],
  },
  {
    topicName: "Asymmetric Encryption",
    concept: "Elliptic curve cryptography (ECC)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary advantage of elliptic curve cryptography (ECC) over RSA?",
        choices: [
          "ECC provides equivalent security with much shorter key lengths",
          "ECC is simpler to implement in software",
          "ECC does not require a private key",
          "ECC can only be used for hashing, not encryption",
        ],
        correctAnswer:
          "ECC provides equivalent security with much shorter key lengths",
        explanation:
          "A 256-bit ECC key provides security roughly equivalent to a 3072-bit RSA key. Shorter keys mean faster computation, lower bandwidth, and smaller storage requirements, making ECC especially valuable for constrained environments like mobile devices and IoT.",
      },
    ],
  },
  {
    topicName: "Asymmetric Encryption",
    concept: "Public and private key relationship",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In an asymmetric key pair, which statement is true about the relationship between the keys?",
        choices: [
          "Data encrypted with the public key can only be decrypted with the corresponding private key",
          "Both keys are identical and interchangeable",
          "The private key is derived by hashing the public key",
          "The public key must be kept secret for the system to be secure",
        ],
        correctAnswer:
          "Data encrypted with the public key can only be decrypted with the corresponding private key",
        explanation:
          "Asymmetric key pairs are mathematically related so that what one key encrypts, only the other can decrypt. The public key is shared openly for encryption, while the private key is kept secret for decryption. This one-way relationship enables secure communication without pre-shared secrets.",
      },
    ],
  },
  {
    topicName: "Asymmetric Encryption",
    concept: "Diffie-Hellman key exchange",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the Diffie-Hellman protocol allow two parties to accomplish?",
        choices: [
          "Agree on a shared secret key over an insecure channel without transmitting the key itself",
          "Encrypt large files faster than AES",
          "Sign documents with a digital signature",
          "Verify the identity of a Certificate Authority",
        ],
        correctAnswer:
          "Agree on a shared secret key over an insecure channel without transmitting the key itself",
        explanation:
          "Diffie-Hellman enables two parties to independently compute the same shared secret by exchanging public values. An eavesdropper who intercepts these public values cannot feasibly compute the shared secret. The derived secret is typically used as a symmetric encryption key.",
      },
    ],
  },
  {
    topicName: "Asymmetric Encryption",
    concept: "Ephemeral Diffie-Hellman (DHE/ECDHE)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What security property does ephemeral Diffie-Hellman (DHE or ECDHE) provide that static Diffie-Hellman does not?",
        choices: [
          "Forward secrecy — past sessions remain secure even if the long-term private key is later compromised",
          "Faster key exchange performance",
          "Elimination of the need for digital certificates",
          "Resistance to quantum computing attacks",
        ],
        correctAnswer:
          "Forward secrecy — past sessions remain secure even if the long-term private key is later compromised",
        explanation:
          "Ephemeral Diffie-Hellman generates a new, temporary key pair for each session. Because session keys are not derived from the long-term private key, compromising the server's private key later does not allow decryption of previously recorded traffic. TLS 1.3 requires ephemeral key exchange.",
      },
    ],
  },
  {
    topicName: "Asymmetric Encryption",
    concept: "RSA key sizes",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the minimum RSA key size currently recommended by NIST for adequate security?",
        choices: [
          "2048 bits",
          "512 bits",
          "1024 bits",
          "256 bits",
        ],
        correctAnswer: "2048 bits",
        explanation:
          "NIST recommends a minimum of 2048-bit RSA keys, with 3072 bits recommended for protection beyond 2030. Keys of 1024 bits or shorter are considered insecure due to advances in factoring techniques and computational power.",
      },
    ],
  },
  {
    topicName: "Asymmetric Encryption",
    concept: "Hybrid encryption",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why do most real-world systems use hybrid encryption (combining asymmetric and symmetric encryption)?",
        choices: [
          "Asymmetric encryption is too slow for bulk data, so it is used only to exchange a symmetric key",
          "Symmetric encryption cannot provide any security without asymmetric encryption",
          "Hybrid encryption eliminates the need for key management entirely",
          "Asymmetric encryption produces smaller ciphertext than symmetric encryption",
        ],
        correctAnswer:
          "Asymmetric encryption is too slow for bulk data, so it is used only to exchange a symmetric key",
        explanation:
          "Asymmetric algorithms like RSA are orders of magnitude slower than symmetric algorithms like AES. In practice, asymmetric encryption securely exchanges or wraps a symmetric session key, and the fast symmetric cipher handles the bulk data encryption. TLS uses this hybrid approach.",
      },
    ],
  },
  {
    topicName: "Asymmetric Encryption",
    concept: "RSA padding schemes",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is OAEP (Optimal Asymmetric Encryption Padding) recommended for RSA encryption instead of PKCS#1 v1.5 padding?",
        choices: [
          "OAEP is provably secure against chosen-ciphertext attacks that affect PKCS#1 v1.5",
          "OAEP produces shorter ciphertext",
          "OAEP does not require random number generation",
          "PKCS#1 v1.5 is not compatible with any version of TLS",
        ],
        correctAnswer:
          "OAEP is provably secure against chosen-ciphertext attacks that affect PKCS#1 v1.5",
        explanation:
          "Bleichenbacher's attack (1998) demonstrated that PKCS#1 v1.5 padding leaks information when decryption errors are handled differently from padding errors. OAEP (RSA-OAEP) provides provable security against such chosen-ciphertext attacks by incorporating randomized padding.",
      },
    ],
  },
  {
    topicName: "Asymmetric Encryption",
    concept: "Elliptic curve Diffie-Hellman (ECDH)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Elliptic Curve Diffie-Hellman (ECDH) achieves key agreement based on the difficulty of which mathematical problem?",
        choices: [
          "The elliptic curve discrete logarithm problem (ECDLP)",
          "Integer factorization",
          "The subset sum problem",
          "Finding hash collisions",
        ],
        correctAnswer:
          "The elliptic curve discrete logarithm problem (ECDLP)",
        explanation:
          "ECDH relies on the elliptic curve discrete logarithm problem: given points P and Q = kP on an elliptic curve, it is computationally infeasible to determine the scalar k. This provides strong security with shorter keys than traditional Diffie-Hellman over finite fields.",
      },
    ],
  },
  {
    topicName: "Asymmetric Encryption",
    concept: "Post-quantum cryptography",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why are RSA and ECC considered vulnerable to future quantum computers?",
        choices: [
          "Shor's algorithm can efficiently factor integers and compute discrete logarithms on a quantum computer",
          "Quantum computers can perform brute-force attacks on any key length instantly",
          "Quantum computers break all symmetric encryption algorithms",
          "RSA and ECC use quantum-incompatible data formats",
        ],
        correctAnswer:
          "Shor's algorithm can efficiently factor integers and compute discrete logarithms on a quantum computer",
        explanation:
          "Shor's algorithm, when run on a sufficiently powerful quantum computer, can factor large integers and solve discrete logarithm problems in polynomial time, breaking RSA and ECC. NIST is standardizing post-quantum algorithms like CRYSTALS-Kyber (ML-KEM) to address this threat.",
      },
    ],
  },
  {
    topicName: "Asymmetric Encryption",
    concept: "Key encapsulation mechanism (KEM)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In the context of post-quantum cryptography, what is a Key Encapsulation Mechanism (KEM)?",
        choices: [
          "A method for securely generating and transmitting a symmetric key using asymmetric techniques",
          "A hardware device that stores private keys in tamper-resistant memory",
          "A protocol for revoking expired digital certificates",
          "A technique for compressing public keys to reduce bandwidth",
        ],
        correctAnswer:
          "A method for securely generating and transmitting a symmetric key using asymmetric techniques",
        explanation:
          "A KEM uses asymmetric cryptography to encapsulate (wrap) a randomly generated symmetric key so that only the holder of the corresponding private key can decapsulate (unwrap) it. NIST's ML-KEM (CRYSTALS-Kyber) is a lattice-based KEM selected as a post-quantum standard.",
      },
    ],
  },
  {
    topicName: "Asymmetric Encryption",
    concept: "Digital envelope",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a 'digital envelope' in cryptography?",
        choices: [
          "A message encrypted with a symmetric key, where the symmetric key itself is encrypted with the recipient's public key",
          "An email encrypted end-to-end using only RSA",
          "A digitally signed hash of a document",
          "A certificate chain from a root CA to an end-entity certificate",
        ],
        correctAnswer:
          "A message encrypted with a symmetric key, where the symmetric key itself is encrypted with the recipient's public key",
        explanation:
          "A digital envelope is the standard hybrid encryption pattern: the sender generates a random symmetric key, encrypts the message with it, then encrypts the symmetric key with the recipient's public key. Both encrypted components are sent together. The recipient uses their private key to unwrap the symmetric key.",
      },
    ],
  },
  {
    topicName: "Asymmetric Encryption",
    concept: "Curve25519",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Curve25519 is widely used for which cryptographic purpose?",
        choices: [
          "High-speed elliptic curve Diffie-Hellman key agreement",
          "Symmetric block cipher encryption",
          "Generating SHA-256 hash digests",
          "Compressing TLS certificates",
        ],
        correctAnswer:
          "High-speed elliptic curve Diffie-Hellman key agreement",
        explanation:
          "Curve25519, designed by Daniel Bernstein, is an elliptic curve optimized for fast, secure Diffie-Hellman key exchange (X25519). It is used in TLS 1.3, Signal Protocol, WireGuard, and SSH. Its design resists common implementation pitfalls like timing side-channel attacks.",
      },
    ],
  },

  // ─── Hashing & Integrity (13 nodes) ───

  {
    topicName: "Hashing & Integrity",
    concept: "Cryptographic hash function properties",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which property of a cryptographic hash function means that it is infeasible to reconstruct the original input from its hash output?",
        choices: [
          "Pre-image resistance",
          "Collision resistance",
          "Diffusion",
          "Key derivation",
        ],
        correctAnswer: "Pre-image resistance",
        explanation:
          "Pre-image resistance (one-wayness) means that given a hash value h, it is computationally infeasible to find any input m such that hash(m) = h. This property is essential for password storage and data integrity verification.",
      },
    ],
  },
  {
    topicName: "Hashing & Integrity",
    concept: "SHA-256",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "SHA-256 belongs to which family of cryptographic hash functions?",
        choices: [
          "SHA-2",
          "SHA-1",
          "MD5",
          "SHA-3",
        ],
        correctAnswer: "SHA-2",
        explanation:
          "SHA-256 is a member of the SHA-2 family, which also includes SHA-224, SHA-384, and SHA-512. Designed by the NSA and published by NIST, SHA-2 is widely used for digital signatures, certificate validation, and data integrity. SHA-256 produces a 256-bit (32-byte) digest.",
      },
    ],
  },
  {
    topicName: "Hashing & Integrity",
    concept: "MD5 vulnerabilities",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is MD5 considered cryptographically broken and unsuitable for security purposes?",
        choices: [
          "Practical collision attacks have been demonstrated, allowing two different inputs to produce the same hash",
          "It produces a hash output that is too long for modern systems",
          "It requires a secret key, making it impractical",
          "It is too slow for real-time applications",
        ],
        correctAnswer:
          "Practical collision attacks have been demonstrated, allowing two different inputs to produce the same hash",
        explanation:
          "Researchers demonstrated practical MD5 collision attacks as early as 2004, and in 2008 created a rogue CA certificate using an MD5 collision. MD5 should not be used for digital signatures, certificates, or any security-sensitive application. It remains acceptable only as a non-security checksum.",
      },
    ],
  },
  {
    topicName: "Hashing & Integrity",
    concept: "SHA-1 deprecation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What event in 2017 conclusively demonstrated that SHA-1 should no longer be trusted for collision resistance?",
        choices: [
          "Google's SHAttered project produced the first practical SHA-1 collision",
          "NIST published SHA-3 as a replacement",
          "A brute-force attack broke a 256-bit SHA-1 key",
          "SHA-1 was found to be identical to MD5 internally",
        ],
        correctAnswer:
          "Google's SHAttered project produced the first practical SHA-1 collision",
        explanation:
          "In 2017, researchers from Google and CWI Amsterdam produced two different PDF files with the same SHA-1 hash (the SHAttered attack). This practical collision confirmed theoretical weaknesses known since 2005. Major browsers and CAs had already begun rejecting SHA-1 certificates.",
      },
    ],
  },
  {
    topicName: "Hashing & Integrity",
    concept: "SHA-3 (Keccak)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What distinguishes SHA-3 from SHA-2 in terms of internal design?",
        choices: [
          "SHA-3 uses a sponge construction, while SHA-2 uses a Merkle-Damgard construction",
          "SHA-3 produces shorter digests than SHA-2",
          "SHA-3 requires a secret key while SHA-2 does not",
          "SHA-3 is a symmetric block cipher, while SHA-2 is a hash function",
        ],
        correctAnswer:
          "SHA-3 uses a sponge construction, while SHA-2 uses a Merkle-Damgard construction",
        explanation:
          "SHA-3 (Keccak) uses a fundamentally different internal structure called a sponge construction, which absorbs input and squeezes out the hash. This design diversity provides a backup if structural weaknesses are found in the Merkle-Damgard construction used by SHA-2.",
      },
    ],
  },
  {
    topicName: "Hashing & Integrity",
    concept: "HMAC (Hash-based Message Authentication Code)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does HMAC provide that a plain hash function does not?",
        choices: [
          "Proof that the message was created by someone who possesses the shared secret key",
          "Encryption of the message contents",
          "Compression of the message to a fixed size",
          "The ability to reverse the hash to recover the original message",
        ],
        correctAnswer:
          "Proof that the message was created by someone who possesses the shared secret key",
        explanation:
          "HMAC combines a cryptographic hash function with a secret key to produce a message authentication code. Unlike a plain hash, an attacker cannot forge an HMAC without the secret key. HMAC provides both integrity verification and authentication of the message origin.",
      },
    ],
  },
  {
    topicName: "Hashing & Integrity",
    concept: "Password hashing with bcrypt",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is bcrypt preferred over plain SHA-256 for hashing passwords?",
        choices: [
          "bcrypt is deliberately slow and includes a configurable work factor to resist brute-force attacks",
          "bcrypt produces a shorter hash digest",
          "SHA-256 cannot hash strings, only binary files",
          "bcrypt uses asymmetric encryption internally",
        ],
        correctAnswer:
          "bcrypt is deliberately slow and includes a configurable work factor to resist brute-force attacks",
        explanation:
          "bcrypt is designed to be computationally expensive, with a cost parameter that can be increased as hardware improves. This makes brute-force and dictionary attacks impractical. General-purpose hash functions like SHA-256 are designed to be fast, which is the opposite of what is needed for password storage.",
      },
    ],
  },
  {
    topicName: "Hashing & Integrity",
    concept: "Salt in password hashing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of adding a random salt to a password before hashing?",
        choices: [
          "To ensure that identical passwords produce different hashes, defeating precomputed rainbow table attacks",
          "To encrypt the password so it can be decrypted later",
          "To shorten the hash output for more efficient storage",
          "To make the hash function run faster",
        ],
        correctAnswer:
          "To ensure that identical passwords produce different hashes, defeating precomputed rainbow table attacks",
        explanation:
          "A salt is a random value unique to each password that is concatenated with the password before hashing. Even if two users choose the same password, their hashes will differ because their salts differ. This prevents attackers from using precomputed tables (rainbow tables) to crack passwords in bulk.",
      },
    ],
  },
  {
    topicName: "Hashing & Integrity",
    concept: "Rainbow table attack",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a rainbow table attack?",
        choices: [
          "Using precomputed tables of hash values to reverse password hashes without brute-forcing each one",
          "Flooding a server with rainbow-colored packets to cause a denial of service",
          "Injecting malicious code into a hash function implementation",
          "Intercepting hash values during transmission over a network",
        ],
        correctAnswer:
          "Using precomputed tables of hash values to reverse password hashes without brute-forcing each one",
        explanation:
          "A rainbow table is a precomputed lookup table mapping hash values back to their plaintext inputs. An attacker who obtains a database of unsalted password hashes can quickly look up the original passwords. Salting passwords renders rainbow tables ineffective because each salt creates a unique mapping.",
      },
    ],
  },
  {
    topicName: "Hashing & Integrity",
    concept: "Argon2 password hashing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What makes Argon2 particularly resistant to attacks using specialized hardware like GPUs and ASICs?",
        choices: [
          "It is memory-hard, requiring large amounts of RAM that are expensive to parallelize on GPUs and ASICs",
          "It uses a 1024-bit hash output that is too large for GPUs to process",
          "It encrypts the password with AES before hashing",
          "It requires a network connection to a key server during hashing",
        ],
        correctAnswer:
          "It is memory-hard, requiring large amounts of RAM that are expensive to parallelize on GPUs and ASICs",
        explanation:
          "Argon2 (winner of the Password Hashing Competition in 2015) is designed to be memory-hard: it requires configurable amounts of memory to compute, making massively parallel attacks on GPUs or custom ASICs economically impractical. Argon2id is the recommended variant.",
      },
    ],
  },
  {
    topicName: "Hashing & Integrity",
    concept: "File integrity monitoring",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How are cryptographic hashes used for file integrity monitoring?",
        choices: [
          "A hash of each file is stored; later, the file is re-hashed and compared to detect unauthorized changes",
          "Files are encrypted with their own hash as the key",
          "Hashes are used to compress files for storage efficiency",
          "Each file is digitally signed by the operating system kernel",
        ],
        correctAnswer:
          "A hash of each file is stored; later, the file is re-hashed and compared to detect unauthorized changes",
        explanation:
          "File integrity monitoring (FIM) tools like AIDE and Tripwire compute cryptographic hashes of critical system files and store them in a secure database. Periodically, files are re-hashed and compared. Any mismatch indicates that the file has been modified, possibly by malware or an intruder.",
      },
    ],
  },
  {
    topicName: "Hashing & Integrity",
    concept: "Collision attack vs. pre-image attack",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the difference between a collision attack and a pre-image attack on a hash function?",
        choices: [
          "A collision attack finds any two inputs with the same hash; a pre-image attack finds an input matching a specific hash",
          "A pre-image attack finds two inputs with the same hash; a collision attack finds an input matching a specific hash",
          "Both attacks are identical in method and difficulty",
          "Collision attacks target symmetric ciphers; pre-image attacks target hash functions",
        ],
        correctAnswer:
          "A collision attack finds any two inputs with the same hash; a pre-image attack finds an input matching a specific hash",
        explanation:
          "In a collision attack, the attacker chooses both inputs and tries to find any pair that hashes to the same value. In a pre-image attack, the attacker is given a specific hash value and tries to find any input that produces it. Collision attacks are generally easier (birthday bound: 2^(n/2) vs. 2^n).",
      },
    ],
  },
  {
    topicName: "Hashing & Integrity",
    concept: "Merkle tree",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a Merkle tree and where is it commonly used?",
        choices: [
          "A tree of hashes where each parent node is the hash of its children, used in blockchain and data integrity verification",
          "A binary search tree used to store encryption keys sorted by expiration date",
          "A network routing structure used in VPN tunnel establishment",
          "A file system hierarchy encrypted with a root certificate",
        ],
        correctAnswer:
          "A tree of hashes where each parent node is the hash of its children, used in blockchain and data integrity verification",
        explanation:
          "A Merkle tree (hash tree) recursively hashes pairs of data blocks, combining hashes up to a single root hash. Changing any data block changes the root hash. This structure enables efficient integrity verification of large datasets and is fundamental to blockchain, Git, and certificate transparency.",
      },
    ],
  },

  // ─── Digital Signatures & Certificates (12 nodes) ───

  {
    topicName: "Digital Signatures & Certificates",
    concept: "How digital signatures work",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the correct process for creating a digital signature?",
        choices: [
          "Hash the message, then encrypt the hash with the signer's private key",
          "Encrypt the entire message with the signer's public key",
          "Hash the message, then encrypt the hash with the recipient's public key",
          "Encrypt the message with a symmetric key and attach the key",
        ],
        correctAnswer:
          "Hash the message, then encrypt the hash with the signer's private key",
        explanation:
          "The signer first computes a hash (digest) of the message, then encrypts that hash with their private key to produce the signature. The recipient decrypts the signature with the signer's public key and compares it to their own hash of the message. A match confirms authenticity and integrity.",
      },
    ],
  },
  {
    topicName: "Digital Signatures & Certificates",
    concept: "Digital signature verification",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "When verifying a digital signature, which key does the verifier use?",
        choices: [
          "The signer's public key",
          "The signer's private key",
          "The verifier's private key",
          "A shared symmetric key",
        ],
        correctAnswer: "The signer's public key",
        explanation:
          "The verifier uses the signer's public key to decrypt the signature and recover the hash. They then independently hash the received message and compare the two hash values. If they match, the signature is valid, confirming the message's authenticity and integrity.",
      },
    ],
  },
  {
    topicName: "Digital Signatures & Certificates",
    concept: "Non-repudiation through digital signatures",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How do digital signatures provide non-repudiation?",
        choices: [
          "Only the signer's private key could have created the signature, so the signer cannot deny signing",
          "The signature encrypts the entire message, preventing anyone from reading it",
          "Digital signatures use symmetric keys shared between both parties",
          "The recipient's public key is embedded in the signature",
        ],
        correctAnswer:
          "Only the signer's private key could have created the signature, so the signer cannot deny signing",
        explanation:
          "Because only the holder of the private key can produce a valid signature that decrypts correctly with the corresponding public key, the signer cannot credibly deny having signed the document. This property is legally significant for contracts, transactions, and audit trails.",
      },
    ],
  },
  {
    topicName: "Digital Signatures & Certificates",
    concept: "X.509 digital certificates",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What information does an X.509 digital certificate primarily bind together?",
        choices: [
          "A public key and the identity of its owner, vouched for by a Certificate Authority",
          "A symmetric key and a session identifier",
          "Two private keys belonging to different users",
          "A hash function and an encryption algorithm",
        ],
        correctAnswer:
          "A public key and the identity of its owner, vouched for by a Certificate Authority",
        explanation:
          "An X.509 certificate contains the subject's public key, identity information (Common Name, Organization, etc.), the issuing CA's signature, validity period, and other metadata. The CA's signature vouches that the public key genuinely belongs to the stated identity.",
      },
    ],
  },
  {
    topicName: "Digital Signatures & Certificates",
    concept: "Certificate Authority (CA)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary role of a Certificate Authority (CA) in a PKI system?",
        choices: [
          "To verify identities and issue digitally signed certificates that bind public keys to those identities",
          "To generate and store all users' private keys",
          "To encrypt all data transmitted over the internet",
          "To act as a firewall between internal and external networks",
        ],
        correctAnswer:
          "To verify identities and issue digitally signed certificates that bind public keys to those identities",
        explanation:
          "A CA is a trusted third party that validates the identity of certificate applicants and issues signed certificates. When a browser trusts a CA, it automatically trusts certificates issued by that CA, forming the foundation of trust on the web.",
      },
    ],
  },
  {
    topicName: "Digital Signatures & Certificates",
    concept: "Certificate chain of trust",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In a certificate chain, what is the relationship between a root CA, intermediate CA, and end-entity certificate?",
        choices: [
          "The root CA signs the intermediate CA's certificate, which in turn signs end-entity certificates",
          "The end-entity signs the intermediate, which signs the root",
          "All three certificates are self-signed independently",
          "The root CA directly signs every end-entity certificate with no intermediaries",
        ],
        correctAnswer:
          "The root CA signs the intermediate CA's certificate, which in turn signs end-entity certificates",
        explanation:
          "The chain of trust flows from a self-signed root CA certificate (stored in the OS or browser trust store) to one or more intermediate CA certificates, and finally to the end-entity (leaf) certificate. Each certificate in the chain is signed by the issuer above it.",
      },
    ],
  },
  {
    topicName: "Digital Signatures & Certificates",
    concept: "Certificate revocation (CRL and OCSP)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of a Certificate Revocation List (CRL)?",
        choices: [
          "To publish a list of certificates that have been revoked before their expiration date",
          "To list all valid certificates issued by a CA",
          "To store the private keys associated with revoked certificates",
          "To encrypt certificates during transmission",
        ],
        correctAnswer:
          "To publish a list of certificates that have been revoked before their expiration date",
        explanation:
          "A CRL is a signed list published by a CA containing the serial numbers of certificates that have been revoked (e.g., due to key compromise). OCSP (Online Certificate Status Protocol) provides real-time, per-certificate status checks as a more efficient alternative to downloading full CRLs.",
      },
    ],
  },
  {
    topicName: "Digital Signatures & Certificates",
    concept: "Self-signed certificates",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a self-signed certificate?",
        choices: [
          "A certificate where the issuer and subject are the same entity, signed with its own private key",
          "A certificate signed by two different Certificate Authorities",
          "A certificate that automatically renews itself before expiration",
          "A certificate that does not contain a public key",
        ],
        correctAnswer:
          "A certificate where the issuer and subject are the same entity, signed with its own private key",
        explanation:
          "A self-signed certificate is signed by the same entity it identifies, rather than by a trusted CA. Root CA certificates are self-signed by design. When used for web servers, self-signed certificates trigger browser warnings because no independent CA vouches for the identity.",
      },
    ],
  },
  {
    topicName: "Digital Signatures & Certificates",
    concept: "DSA and ECDSA",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is ECDSA?",
        choices: [
          "The Elliptic Curve Digital Signature Algorithm — a variant of DSA using elliptic curve cryptography",
          "A symmetric encryption standard for disk encryption",
          "A hash function used in blockchain mining",
          "A key exchange protocol for VPN connections",
        ],
        correctAnswer:
          "The Elliptic Curve Digital Signature Algorithm — a variant of DSA using elliptic curve cryptography",
        explanation:
          "ECDSA applies the Digital Signature Algorithm (DSA) over elliptic curves instead of traditional finite fields. This provides the same security as DSA with significantly shorter key and signature sizes. ECDSA is used in TLS, Bitcoin, and many authentication systems.",
      },
    ],
  },
  {
    topicName: "Digital Signatures & Certificates",
    concept: "Ed25519 signatures",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is Ed25519?",
        choices: [
          "A high-speed digital signature scheme based on the Edwards curve Curve25519",
          "A block cipher mode of operation for AES",
          "A certificate revocation protocol",
          "A password hashing algorithm",
        ],
        correctAnswer:
          "A high-speed digital signature scheme based on the Edwards curve Curve25519",
        explanation:
          "Ed25519, designed by Daniel Bernstein, uses the Edwards-curve variant of Curve25519 for fast, secure digital signatures. It is deterministic (no random nonce needed per signature), resistant to side-channel attacks, and widely used in SSH, TLS, and software signing.",
      },
    ],
  },
  {
    topicName: "Digital Signatures & Certificates",
    concept: "Code signing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of code signing?",
        choices: [
          "To verify that software has not been tampered with and comes from a known publisher",
          "To encrypt the source code so competitors cannot read it",
          "To compress executables for faster download",
          "To obfuscate code to prevent reverse engineering",
        ],
        correctAnswer:
          "To verify that software has not been tampered with and comes from a known publisher",
        explanation:
          "Code signing uses digital signatures to authenticate the publisher and ensure the code has not been modified since signing. Operating systems and app stores use code signatures to warn users about or block unsigned or tampered software.",
      },
    ],
  },
  {
    topicName: "Digital Signatures & Certificates",
    concept: "Certificate pinning",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does certificate pinning accomplish in a mobile or web application?",
        choices: [
          "It associates a specific server with its expected certificate or public key, rejecting unexpected certificates even if they are CA-signed",
          "It permanently stores the server's private key on the client device",
          "It encrypts the certificate with the user's password",
          "It prevents the certificate from ever expiring",
        ],
        correctAnswer:
          "It associates a specific server with its expected certificate or public key, rejecting unexpected certificates even if they are CA-signed",
        explanation:
          "Certificate pinning hardcodes or configures the expected certificate or public key for a specific server. If an attacker obtains a fraudulent certificate from a compromised CA, the pinned application will reject it because it does not match the expected pin. This mitigates CA compromise risks.",
      },
    ],
  },

  // ─── PKI & TLS (13 nodes) ───

  {
    topicName: "PKI & TLS",
    concept: "PKI components overview",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which of the following is NOT a standard component of a Public Key Infrastructure (PKI)?",
        choices: [
          "A symmetric key distribution center (KDC)",
          "A Certificate Authority (CA)",
          "A Registration Authority (RA)",
          "A certificate repository",
        ],
        correctAnswer: "A symmetric key distribution center (KDC)",
        explanation:
          "PKI components include Certificate Authorities (issue and sign certificates), Registration Authorities (verify identities before CA issues certificates), certificate repositories (store and distribute certificates and CRLs), and end entities. A KDC is part of Kerberos, not PKI.",
      },
    ],
  },
  {
    topicName: "PKI & TLS",
    concept: "TLS handshake overview",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of the TLS handshake?",
        choices: [
          "To negotiate cipher suites, authenticate the server, and establish a shared session key",
          "To transfer the web page content to the browser",
          "To verify the user's login credentials",
          "To compress HTTP requests for faster transmission",
        ],
        correctAnswer:
          "To negotiate cipher suites, authenticate the server, and establish a shared session key",
        explanation:
          "During the TLS handshake, the client and server agree on which cryptographic algorithms to use, the server presents its certificate for authentication, and both parties derive a shared symmetric session key. After the handshake, all application data is encrypted with this session key.",
      },
    ],
  },
  {
    topicName: "PKI & TLS",
    concept: "TLS 1.3 improvements",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which of the following is a key improvement in TLS 1.3 over TLS 1.2?",
        choices: [
          "The handshake completes in one round trip (1-RTT) instead of two, and removes insecure legacy algorithms",
          "It adds support for MD5 and SHA-1 cipher suites",
          "It allows connections without any encryption for performance",
          "It requires RSA key exchange as the default method",
        ],
        correctAnswer:
          "The handshake completes in one round trip (1-RTT) instead of two, and removes insecure legacy algorithms",
        explanation:
          "TLS 1.3 reduces handshake latency to 1-RTT (and supports 0-RTT resumption). It removes all insecure algorithms: no RSA key exchange (only ephemeral Diffie-Hellman), no CBC mode, no RC4, no SHA-1. Only AEAD ciphers like AES-GCM and ChaCha20-Poly1305 are permitted.",
      },
    ],
  },
  {
    topicName: "PKI & TLS",
    concept: "Cipher suite negotiation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In TLS, what does a cipher suite specify?",
        choices: [
          "The key exchange algorithm, authentication method, bulk encryption cipher, and MAC algorithm to use for the session",
          "Only the symmetric encryption algorithm",
          "The IP addresses of the client and server",
          "The certificate expiration policy",
        ],
        correctAnswer:
          "The key exchange algorithm, authentication method, bulk encryption cipher, and MAC algorithm to use for the session",
        explanation:
          "A cipher suite is a named combination of algorithms for each phase of the TLS connection. For example, TLS_AES_256_GCM_SHA384 in TLS 1.3 specifies AES-256-GCM for encryption and SHA-384 for the hash. The client offers supported suites, and the server selects one.",
      },
    ],
  },
  {
    topicName: "PKI & TLS",
    concept: "Forward secrecy in TLS",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does TLS achieve forward secrecy?",
        choices: [
          "By using ephemeral key exchange (ECDHE) so that each session has a unique key not derived from the server's long-term private key",
          "By storing all session keys in a secure database",
          "By using RSA key exchange with a 4096-bit key",
          "By rotating the server's TLS certificate every hour",
        ],
        correctAnswer:
          "By using ephemeral key exchange (ECDHE) so that each session has a unique key not derived from the server's long-term private key",
        explanation:
          "Forward secrecy (also called perfect forward secrecy) ensures that compromising the server's long-term private key does not expose past session data. Each TLS session uses ephemeral Diffie-Hellman keys that are discarded after the session ends. TLS 1.3 mandates this behavior.",
      },
    ],
  },
  {
    topicName: "PKI & TLS",
    concept: "Certificate Transparency (CT)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What problem does Certificate Transparency (CT) aim to solve?",
        choices: [
          "Detecting fraudulently or mistakenly issued certificates by requiring CAs to log all issued certificates publicly",
          "Encrypting certificate data so only the intended recipient can read it",
          "Speeding up TLS handshakes by caching certificates",
          "Replacing Certificate Authorities entirely with a decentralized system",
        ],
        correctAnswer:
          "Detecting fraudulently or mistakenly issued certificates by requiring CAs to log all issued certificates publicly",
        explanation:
          "Certificate Transparency requires CAs to submit all issued certificates to public, append-only logs. Domain owners and monitors can audit these logs to detect unauthorized certificates. Major browsers now require CT compliance for all publicly trusted certificates.",
      },
    ],
  },
  {
    topicName: "PKI & TLS",
    concept: "Let's Encrypt and ACME",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the ACME protocol used by Let's Encrypt?",
        choices: [
          "An automated protocol for domain validation and certificate issuance/renewal without manual intervention",
          "A symmetric encryption algorithm for securing email",
          "A network scanning tool for identifying TLS misconfigurations",
          "A log format for recording TLS handshake errors",
        ],
        correctAnswer:
          "An automated protocol for domain validation and certificate issuance/renewal without manual intervention",
        explanation:
          "ACME (Automatic Certificate Management Environment) automates the process of proving domain ownership, requesting certificates, and renewing them. Let's Encrypt uses ACME to provide free, automated TLS certificates, significantly increasing HTTPS adoption across the web.",
      },
    ],
  },
  {
    topicName: "PKI & TLS",
    concept: "HSTS (HTTP Strict Transport Security)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the HTTP Strict Transport Security (HSTS) header instruct browsers to do?",
        choices: [
          "Always connect to the site over HTTPS, even if the user types http:// or follows an HTTP link",
          "Disable caching of the website's content",
          "Require the user to enter a password before viewing the page",
          "Block all JavaScript execution on the page",
        ],
        correctAnswer:
          "Always connect to the site over HTTPS, even if the user types http:// or follows an HTTP link",
        explanation:
          "HSTS tells browsers to only communicate with the server over HTTPS for a specified duration. This prevents protocol downgrade attacks and cookie hijacking over HTTP. Sites can also be added to browser preload lists to enforce HSTS from the very first visit.",
      },
    ],
  },
  {
    topicName: "PKI & TLS",
    concept: "SSL/TLS version history",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which TLS/SSL versions are considered deprecated and insecure?",
        choices: [
          "SSL 2.0, SSL 3.0, TLS 1.0, and TLS 1.1",
          "Only SSL 2.0",
          "TLS 1.2 and TLS 1.3",
          "All versions of TLS are insecure",
        ],
        correctAnswer: "SSL 2.0, SSL 3.0, TLS 1.0, and TLS 1.1",
        explanation:
          "SSL 2.0 and 3.0 have critical vulnerabilities (DROWN, POODLE). TLS 1.0 and 1.1 were deprecated by RFC 8996 in 2021 due to weaknesses in their design and cipher suite requirements. TLS 1.2 (with modern cipher suites) and TLS 1.3 are the only versions considered secure.",
      },
    ],
  },
  {
    topicName: "PKI & TLS",
    concept: "mTLS (Mutual TLS)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What distinguishes mutual TLS (mTLS) from standard TLS?",
        choices: [
          "Both the client and the server present certificates and authenticate each other",
          "The server authenticates to the client, but the client does not authenticate to the server",
          "mTLS uses only symmetric encryption with no certificates",
          "mTLS eliminates the need for a Certificate Authority",
        ],
        correctAnswer:
          "Both the client and the server present certificates and authenticate each other",
        explanation:
          "In standard TLS, only the server presents a certificate. In mTLS, the client also presents a certificate, enabling the server to cryptographically verify the client's identity. mTLS is commonly used in zero-trust architectures, service-to-service communication, and API security.",
      },
    ],
  },
  {
    topicName: "PKI & TLS",
    concept: "TLS termination",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is TLS termination (or SSL offloading)?",
        choices: [
          "Decrypting TLS traffic at a load balancer or reverse proxy before forwarding plaintext to backend servers",
          "Closing a TLS connection after a timeout period",
          "Rejecting all TLS connections that use outdated cipher suites",
          "Encrypting traffic between two backend servers",
        ],
        correctAnswer:
          "Decrypting TLS traffic at a load balancer or reverse proxy before forwarding plaintext to backend servers",
        explanation:
          "TLS termination offloads the computationally expensive decryption to a dedicated device (load balancer, reverse proxy, or CDN edge node). Backend servers receive unencrypted traffic, reducing their processing load. The internal network between the termination point and backends must be secured separately.",
      },
    ],
  },
  {
    topicName: "PKI & TLS",
    concept: "OCSP stapling",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is OCSP stapling and why is it preferred over standard OCSP?",
        choices: [
          "The server periodically fetches its own certificate status from the CA and presents it during the TLS handshake, improving privacy and performance",
          "The client queries the CA for every certificate it encounters during browsing",
          "The server embeds the CRL directly inside its TLS certificate",
          "The CA pushes revocation updates to all browsers in real time",
        ],
        correctAnswer:
          "The server periodically fetches its own certificate status from the CA and presents it during the TLS handshake, improving privacy and performance",
        explanation:
          "With OCSP stapling, the server obtains a signed, timestamped OCSP response from the CA and 'staples' it to the TLS handshake. This eliminates the client's need to contact the CA directly, improving TLS connection speed and preventing the CA from learning which sites a user visits.",
      },
    ],
  },
  {
    topicName: "PKI & TLS",
    concept: "SNI (Server Name Indication)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What problem does the TLS Server Name Indication (SNI) extension solve?",
        choices: [
          "It allows multiple HTTPS websites to share a single IP address by including the requested hostname in the TLS handshake",
          "It encrypts the hostname to prevent eavesdroppers from seeing which site is being visited",
          "It replaces DNS lookups during TLS connections",
          "It authenticates the client's identity to the server",
        ],
        correctAnswer:
          "It allows multiple HTTPS websites to share a single IP address by including the requested hostname in the TLS handshake",
        explanation:
          "SNI includes the desired hostname in the initial ClientHello message of the TLS handshake, allowing the server to present the correct certificate when hosting multiple domains on one IP address. Without SNI, the server would not know which certificate to present before encryption is established.",
      },
    ],
  },

  // ─── Key Management (12 nodes) ───

  {
    topicName: "Key Management",
    concept: "Key lifecycle overview",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which of the following represents the correct phases of a cryptographic key lifecycle?",
        choices: [
          "Generation, distribution, storage, use, rotation, destruction",
          "Encryption, decryption, transmission, reception",
          "Hashing, signing, verifying, revoking",
          "Authentication, authorization, accounting, auditing",
        ],
        correctAnswer:
          "Generation, distribution, storage, use, rotation, destruction",
        explanation:
          "The key lifecycle encompasses generating keys securely, distributing them to authorized parties, storing them safely, using them for their intended purpose, rotating them periodically, and securely destroying them when they are no longer needed. Proper lifecycle management is critical to maintaining cryptographic security.",
      },
    ],
  },
  {
    topicName: "Key Management",
    concept: "Key rotation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is regular key rotation important for cryptographic security?",
        choices: [
          "It limits the amount of data encrypted under a single key, reducing exposure if the key is compromised",
          "It makes encryption faster by using shorter keys each time",
          "It eliminates the need for key backups",
          "It automatically fixes vulnerabilities in the encryption algorithm",
        ],
        correctAnswer:
          "It limits the amount of data encrypted under a single key, reducing exposure if the key is compromised",
        explanation:
          "Key rotation replaces active keys with new ones on a regular schedule. If an old key is compromised, only data encrypted with that key is at risk. Rotation also limits the volume of ciphertext available for cryptanalysis against any single key.",
      },
    ],
  },
  {
    topicName: "Key Management",
    concept: "Hardware Security Module (HSM)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary function of a Hardware Security Module (HSM)?",
        choices: [
          "To generate, store, and manage cryptographic keys in tamper-resistant hardware",
          "To monitor network traffic for intrusion attempts",
          "To accelerate web server response times through caching",
          "To perform antivirus scanning on encrypted files",
        ],
        correctAnswer:
          "To generate, store, and manage cryptographic keys in tamper-resistant hardware",
        explanation:
          "HSMs are dedicated physical devices that provide secure key generation, storage, and cryptographic operations within a tamper-resistant boundary. Keys never leave the HSM in plaintext. HSMs are used by CAs, banks, payment processors, and cloud providers to protect high-value keys.",
      },
    ],
  },
  {
    topicName: "Key Management",
    concept: "Key escrow",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is key escrow?",
        choices: [
          "Storing a copy of an encryption key with a trusted third party for recovery purposes",
          "Encrypting a key with another key before storage",
          "Splitting a key into shares distributed to multiple parties",
          "Permanently destroying a key after a set expiration date",
        ],
        correctAnswer:
          "Storing a copy of an encryption key with a trusted third party for recovery purposes",
        explanation:
          "Key escrow involves depositing a copy of a cryptographic key with a trusted third party (escrow agent). This enables key recovery if the original keyholder loses access or in response to lawful requests. Key escrow is controversial because it creates an additional target for attackers.",
      },
    ],
  },
  {
    topicName: "Key Management",
    concept: "Key derivation functions (KDF)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of a Key Derivation Function (KDF)?",
        choices: [
          "To derive one or more cryptographically strong keys from a source of initial keying material, such as a password or shared secret",
          "To compress an encryption key to a shorter length",
          "To convert an asymmetric key into a symmetric key",
          "To sign a message using a hash of the encryption key",
        ],
        correctAnswer:
          "To derive one or more cryptographically strong keys from a source of initial keying material, such as a password or shared secret",
        explanation:
          "KDFs like HKDF and PBKDF2 take initial keying material (which may have low entropy, like a password) and produce strong, uniformly distributed cryptographic keys. PBKDF2 adds iterations to slow down brute-force attacks; HKDF is used for key expansion in protocols like TLS 1.3.",
      },
    ],
  },
  {
    topicName: "Key Management",
    concept: "Key wrapping",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is key wrapping in cryptography?",
        choices: [
          "Encrypting one cryptographic key with another key for secure storage or transport",
          "Adding padding to a key to increase its bit length",
          "Splitting a key into multiple fragments for distributed storage",
          "Computing a hash of a key to verify its integrity",
        ],
        correctAnswer:
          "Encrypting one cryptographic key with another key for secure storage or transport",
        explanation:
          "Key wrapping uses a Key Encryption Key (KEK) to encrypt (wrap) another key, protecting it during storage or transmission. The wrapped key can only be unwrapped by a party possessing the KEK. AES Key Wrap (RFC 3394) is a widely used standard for this purpose.",
      },
    ],
  },
  {
    topicName: "Key Management",
    concept: "Shamir's Secret Sharing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does Shamir's Secret Sharing scheme accomplish?",
        choices: [
          "It splits a secret into multiple shares so that a minimum number of shares (threshold) are needed to reconstruct it",
          "It encrypts a secret with multiple layers of different algorithms",
          "It generates a unique key pair for each share holder",
          "It compresses a secret key for more efficient storage",
        ],
        correctAnswer:
          "It splits a secret into multiple shares so that a minimum number of shares (threshold) are needed to reconstruct it",
        explanation:
          "Shamir's Secret Sharing (SSS) divides a secret (e.g., a master key) into n shares such that any k shares (the threshold) can reconstruct the secret, but fewer than k shares reveal no information about it. This is used for key backup, disaster recovery, and multi-party authorization.",
      },
    ],
  },
  {
    topicName: "Key Management",
    concept: "Envelope encryption",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In cloud environments, what is envelope encryption?",
        choices: [
          "Data is encrypted with a data key, and the data key is encrypted with a master key stored in a key management service",
          "Every file is encrypted directly with the master key",
          "Data is hashed with a master key and stored alongside the hash",
          "Encryption keys are embedded inside the encrypted data file",
        ],
        correctAnswer:
          "Data is encrypted with a data key, and the data key is encrypted with a master key stored in a key management service",
        explanation:
          "Envelope encryption uses a two-tier key hierarchy: a unique data encryption key (DEK) encrypts the actual data, and a master key (or key encryption key) in a KMS wraps the DEK. Only the wrapped DEK is stored alongside the ciphertext. This limits master key exposure and enables efficient key rotation.",
      },
    ],
  },
  {
    topicName: "Key Management",
    concept: "Cloud KMS services",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary benefit of using a cloud Key Management Service (KMS) like AWS KMS or Google Cloud KMS?",
        choices: [
          "Centralized key management with access controls, auditing, and HSM-backed storage",
          "Eliminating the need for encryption entirely",
          "Allowing all users to access all keys without restrictions",
          "Automatically decrypting all stored data for easy access",
        ],
        correctAnswer:
          "Centralized key management with access controls, auditing, and HSM-backed storage",
        explanation:
          "Cloud KMS services provide centralized creation, rotation, and management of encryption keys backed by HSMs. They integrate with IAM for fine-grained access control and provide audit logs of all key usage. This simplifies compliance and reduces the risk of key mismanagement.",
      },
    ],
  },
  {
    topicName: "Key Management",
    concept: "Key compromise and incident response",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the first critical action to take when a private key compromise is suspected?",
        choices: [
          "Revoke the associated certificate and generate a new key pair",
          "Increase the key size and continue using the same key",
          "Wait for the certificate to expire naturally",
          "Share the compromised key with a trusted third party for analysis",
        ],
        correctAnswer:
          "Revoke the associated certificate and generate a new key pair",
        explanation:
          "When a private key is suspected of being compromised, the associated certificate must be revoked immediately (via CRL or OCSP) to prevent attackers from impersonating the key owner. A new key pair and certificate should be generated and deployed. Any data encrypted with the compromised key should be considered potentially exposed.",
      },
    ],
  },
  {
    topicName: "Key Management",
    concept: "Secure key destruction",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is secure key destruction (zeroization) important at the end of a key's lifecycle?",
        choices: [
          "To ensure that retired keys cannot be recovered and used to decrypt previously encrypted data",
          "To free up storage space on the key server",
          "To speed up encryption operations with remaining keys",
          "To comply with the minimum key length requirements",
        ],
        correctAnswer:
          "To ensure that retired keys cannot be recovered and used to decrypt previously encrypted data",
        explanation:
          "Secure key destruction (zeroization) overwrites key material in memory and storage to make recovery impossible. If old keys are not properly destroyed, an attacker who gains access to storage media could recover them and decrypt historical data. NIST SP 800-57 provides guidelines for key destruction.",
      },
    ],
  },
  {
    topicName: "Key Management",
    concept: "Separation of key management duties",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why should the persons who manage encryption keys be different from those who access the encrypted data?",
        choices: [
          "To enforce separation of duties, preventing any single person from both accessing data and controlling its encryption",
          "To speed up encryption and decryption operations",
          "To reduce the total number of keys in the system",
          "To eliminate the need for key rotation",
        ],
        correctAnswer:
          "To enforce separation of duties, preventing any single person from both accessing data and controlling its encryption",
        explanation:
          "Separating key management from data access is a critical control that prevents insiders from single-handedly bypassing encryption protections. A database administrator should not also control the encryption keys for that database. This principle is required by standards like PCI DSS.",
      },
    ],
  },

  // ─── Cryptanalysis Basics (13 nodes) ───

  {
    topicName: "Cryptanalysis Basics",
    concept: "Brute-force attack",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What defines a brute-force attack against an encryption algorithm?",
        choices: [
          "Systematically trying every possible key until the correct one is found",
          "Exploiting a mathematical weakness in the algorithm's design",
          "Intercepting the key during transmission",
          "Tricking the key owner into revealing the key through social engineering",
        ],
        correctAnswer:
          "Systematically trying every possible key until the correct one is found",
        explanation:
          "A brute-force attack exhaustively searches the entire keyspace, trying every possible key. Its feasibility depends on the key length: a 56-bit key (DES) is brute-forceable with modern hardware, while a 256-bit key (AES-256) is computationally infeasible to brute-force.",
      },
    ],
  },
  {
    topicName: "Cryptanalysis Basics",
    concept: "Known-plaintext attack",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In a known-plaintext attack, what does the attacker possess?",
        choices: [
          "Pairs of plaintext and their corresponding ciphertext, both encrypted under the target key",
          "Only the ciphertext with no knowledge of the plaintext",
          "The encryption key but not the algorithm",
          "Access to the decryption hardware but not the key",
        ],
        correctAnswer:
          "Pairs of plaintext and their corresponding ciphertext, both encrypted under the target key",
        explanation:
          "In a known-plaintext attack, the attacker has samples of both the plaintext and the ciphertext produced by the same key. The goal is to deduce the key or a method to decrypt other ciphertext. Modern algorithms like AES are designed to resist known-plaintext attacks.",
      },
    ],
  },
  {
    topicName: "Cryptanalysis Basics",
    concept: "Chosen-plaintext attack",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What distinguishes a chosen-plaintext attack from a known-plaintext attack?",
        choices: [
          "The attacker can choose specific plaintexts and obtain their corresponding ciphertexts",
          "The attacker can only observe ciphertext without knowing any plaintext",
          "The attacker modifies the ciphertext during transmission",
          "The attacker has physical access to the encryption hardware",
        ],
        correctAnswer:
          "The attacker can choose specific plaintexts and obtain their corresponding ciphertexts",
        explanation:
          "In a chosen-plaintext attack, the attacker selects arbitrary plaintexts and obtains their encrypted outputs. This is a stronger attack model than known-plaintext because the attacker can craft inputs designed to reveal information about the key. Secure ciphers must resist this attack model.",
      },
    ],
  },
  {
    topicName: "Cryptanalysis Basics",
    concept: "Chosen-ciphertext attack",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In a chosen-ciphertext attack, what capability does the attacker have?",
        choices: [
          "The attacker can submit chosen ciphertexts and obtain their decrypted plaintexts",
          "The attacker can only choose plaintexts to encrypt",
          "The attacker can only observe encrypted traffic passively",
          "The attacker can modify the encryption algorithm",
        ],
        correctAnswer:
          "The attacker can submit chosen ciphertexts and obtain their decrypted plaintexts",
        explanation:
          "A chosen-ciphertext attack allows the attacker to decrypt arbitrary ciphertexts (except the target) via an oracle. Bleichenbacher's attack on RSA PKCS#1 v1.5 and padding oracle attacks on CBC mode are practical examples. AEAD modes and OAEP padding defend against this class of attack.",
      },
    ],
  },
  {
    topicName: "Cryptanalysis Basics",
    concept: "Side-channel attacks",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a side-channel attack?",
        choices: [
          "An attack that exploits physical implementation characteristics (timing, power consumption, electromagnetic emissions) rather than mathematical weaknesses",
          "An attack that targets the network channel between two communicating parties",
          "An attack that uses social engineering to obtain encryption keys",
          "An attack that brute-forces the key by trying all possible values",
        ],
        correctAnswer:
          "An attack that exploits physical implementation characteristics (timing, power consumption, electromagnetic emissions) rather than mathematical weaknesses",
        explanation:
          "Side-channel attacks extract secret information from the physical implementation of a cryptographic system rather than from its mathematical properties. Examples include timing attacks (measuring operation duration), power analysis (monitoring power consumption), and cache-timing attacks like Spectre.",
      },
    ],
  },
  {
    topicName: "Cryptanalysis Basics",
    concept: "Timing attack",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does a timing attack extract secret information?",
        choices: [
          "By measuring variations in the time a system takes to perform cryptographic operations, which can correlate with secret key bits",
          "By measuring how long it takes to brute-force the key",
          "By recording the exact time a key was generated",
          "By synchronizing two clocks between the attacker and the target",
        ],
        correctAnswer:
          "By measuring variations in the time a system takes to perform cryptographic operations, which can correlate with secret key bits",
        explanation:
          "Timing attacks exploit the fact that different operations (e.g., comparing bytes, performing modular exponentiation) may take different amounts of time depending on the data being processed. Constant-time implementations are the primary defense, ensuring operations take the same time regardless of input.",
      },
    ],
  },
  {
    topicName: "Cryptanalysis Basics",
    concept: "Padding oracle attack",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What vulnerability does a padding oracle attack exploit?",
        choices: [
          "A system that reveals whether the padding of a decrypted ciphertext is valid, allowing byte-by-byte plaintext recovery",
          "A weakness in the key generation random number generator",
          "A flaw in the public key distribution mechanism",
          "An error in the hash function used for integrity checking",
        ],
        correctAnswer:
          "A system that reveals whether the padding of a decrypted ciphertext is valid, allowing byte-by-byte plaintext recovery",
        explanation:
          "A padding oracle attack works when a system responds differently to valid vs. invalid padding after decryption (e.g., different error messages or response times). The attacker manipulates ciphertext bytes and observes responses to decrypt the message without the key. Using AEAD modes like GCM eliminates this vulnerability.",
      },
    ],
  },
  {
    topicName: "Cryptanalysis Basics",
    concept: "Birthday attack",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "The birthday attack exploits which mathematical principle to find hash collisions?",
        choices: [
          "The birthday paradox — in a group of ~23 people, there is a ~50% chance two share a birthday",
          "The pigeonhole principle — if n+1 items are in n boxes, at least one box has two items",
          "Fermat's little theorem about prime numbers",
          "The law of large numbers in probability theory",
        ],
        correctAnswer:
          "The birthday paradox — in a group of ~23 people, there is a ~50% chance two share a birthday",
        explanation:
          "The birthday attack exploits the birthday paradox: collisions become likely much sooner than expected. For an n-bit hash, a brute-force pre-image attack requires ~2^n attempts, but finding any collision requires only ~2^(n/2) attempts. This is why a 128-bit hash provides only 64 bits of collision resistance.",
      },
    ],
  },
  {
    topicName: "Cryptanalysis Basics",
    concept: "Frequency analysis",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Frequency analysis is most effective against which type of cipher?",
        choices: [
          "Simple substitution ciphers where each letter maps to a fixed replacement",
          "AES-256 in GCM mode",
          "Elliptic curve Diffie-Hellman key exchange",
          "SHA-256 hash functions",
        ],
        correctAnswer:
          "Simple substitution ciphers where each letter maps to a fixed replacement",
        explanation:
          "Frequency analysis exploits the fact that in natural language, certain letters and patterns appear with known frequencies (e.g., 'E' is the most common letter in English). Simple substitution ciphers preserve these frequencies in the ciphertext. Modern ciphers use confusion and diffusion to eliminate such statistical patterns.",
      },
    ],
  },
  {
    topicName: "Cryptanalysis Basics",
    concept: "Meet-in-the-middle attack",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a meet-in-the-middle attack, and which cipher is it most famously used against?",
        choices: [
          "An attack that reduces double encryption's effective keyspace by encrypting forward and decrypting backward; it is used against Double DES",
          "An attack that intercepts data between two routers; it is used against VPN protocols",
          "An attack that combines two hash functions to find collisions; it is used against SHA-256",
          "An attack that compromises both endpoints of a TLS session; it is used against TLS 1.3",
        ],
        correctAnswer:
          "An attack that reduces double encryption's effective keyspace by encrypting forward and decrypting backward; it is used against Double DES",
        explanation:
          "The meet-in-the-middle attack encrypts the plaintext with all possible first keys and decrypts the ciphertext with all possible second keys, looking for matches. This reduces Double DES from 2^112 to roughly 2^57 operations, which is why Triple DES uses three operations instead of two.",
      },
    ],
  },
  {
    topicName: "Cryptanalysis Basics",
    concept: "Key reuse vulnerabilities",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is reusing a nonce with the same key in AES-GCM a catastrophic security failure?",
        choices: [
          "It allows attackers to recover the authentication key and forge messages, and may reveal plaintext through XOR of two ciphertexts",
          "It causes the algorithm to run slower but does not affect security",
          "It produces longer ciphertext that exceeds storage limits",
          "It only affects the authentication tag, not the encryption",
        ],
        correctAnswer:
          "It allows attackers to recover the authentication key and forge messages, and may reveal plaintext through XOR of two ciphertexts",
        explanation:
          "Reusing a nonce with the same key in GCM produces identical keystream blocks, allowing an attacker to XOR two ciphertexts to cancel out the keystream and reveal relationships between plaintexts. Worse, the authentication key (GHASH key) can be recovered, enabling forgery. Nonce uniqueness is a strict requirement for GCM.",
      },
    ],
  },
  {
    topicName: "Cryptanalysis Basics",
    concept: "Downgrade attack",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a cryptographic downgrade attack?",
        choices: [
          "Forcing a connection to use a weaker cipher suite or protocol version that is easier to break",
          "Reducing the file size of encrypted data by removing padding",
          "Converting asymmetric encryption to symmetric encryption mid-session",
          "Lowering the CPU priority of encryption operations to cause denial of service",
        ],
        correctAnswer:
          "Forcing a connection to use a weaker cipher suite or protocol version that is easier to break",
        explanation:
          "In a downgrade attack, an attacker manipulates the negotiation process (e.g., TLS handshake) to force both parties to agree on a weaker algorithm or protocol version with known vulnerabilities. The POODLE attack (forcing TLS to fall back to SSL 3.0) is a well-known example. TLS 1.3 includes anti-downgrade mechanisms.",
      },
    ],
  },
  {
    topicName: "Cryptanalysis Basics",
    concept: "Rubber-hose cryptanalysis",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the humorous term 'rubber-hose cryptanalysis' refer to?",
        choices: [
          "Extracting encryption keys through coercion, threats, or torture of the key holder rather than mathematical attacks",
          "Using flexible network cables to intercept encrypted traffic",
          "A technique for bending encryption keys to fit shorter key slots",
          "An attack on rubber-stamped certificate approvals",
        ],
        correctAnswer:
          "Extracting encryption keys through coercion, threats, or torture of the key holder rather than mathematical attacks",
        explanation:
          "Rubber-hose cryptanalysis is a tongue-in-cheek term acknowledging that the weakest link in any cryptographic system is often the human. No amount of mathematical strength can protect a key if the holder can be compelled to reveal it. Plausible deniability features in tools like VeraCrypt attempt to mitigate this threat.",
      },
    ],
  },
];
