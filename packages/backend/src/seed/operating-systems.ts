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
  name: "Operating Systems",
  tier: 0,
  description:
    "Linux and Windows fundamentals, file systems, processes, and permissions",
  prerequisites: [],
  displayOrder: 3,
};

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

export const topics: SeedTopic[] = [
  {
    name: "Linux File System",
    complexityWeight: 1.0,
    displayOrder: 0,
  },
  {
    name: "Linux Permissions",
    complexityWeight: 1.2,
    displayOrder: 1,
  },
  {
    name: "Linux Processes",
    complexityWeight: 1.1,
    displayOrder: 2,
  },
  {
    name: "Linux Networking",
    complexityWeight: 1.3,
    displayOrder: 3,
  },
  {
    name: "Windows Architecture",
    complexityWeight: 1.1,
    displayOrder: 4,
  },
  {
    name: "Windows Security",
    complexityWeight: 1.3,
    displayOrder: 5,
  },
  {
    name: "Windows Administration",
    complexityWeight: 1.2,
    displayOrder: 6,
  },
  {
    name: "Shell Scripting",
    complexityWeight: 1.4,
    displayOrder: 7,
  },
];

// ---------------------------------------------------------------------------
// Nodes
// ---------------------------------------------------------------------------

export const nodes: SeedNode[] = [
  // =======================================================================
  // Linux File System (13 nodes)
  // =======================================================================
  {
    topicName: "Linux File System",
    concept: "The root directory and filesystem hierarchy",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the top-level directory in the Linux filesystem hierarchy?",
        choices: [
          "/home",
          "/root",
          "/",
          "/usr",
        ],
        correctAnswer: "/",
        explanation:
          "The forward slash (/) is the root of the entire Linux filesystem hierarchy. Every other file and directory is located beneath it. The /root directory is the home directory for the root user, which is different from the filesystem root.",
      },
    ],
  },
  {
    topicName: "Linux File System",
    concept: "The /etc directory and system configuration files",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which directory in Linux contains system-wide configuration files?",
        choices: [
          "/var",
          "/etc",
          "/opt",
          "/usr",
        ],
        correctAnswer: "/etc",
        explanation:
          "The /etc directory holds system-wide configuration files such as /etc/passwd, /etc/shadow, /etc/hosts, and /etc/fstab. Attackers often target this directory during post-exploitation to harvest credentials and understand system configuration.",
      },
    ],
  },
  {
    topicName: "Linux File System",
    concept: "The /var directory and variable data",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which Linux directory typically stores log files, mail spools, and other variable data that changes during system operation?",
        choices: [
          "/tmp",
          "/var",
          "/opt",
          "/usr",
        ],
        correctAnswer: "/var",
        explanation:
          "The /var directory contains variable data files including system logs (/var/log), mail (/var/mail), and print spools. Security analysts frequently examine /var/log for evidence of intrusions and suspicious activity.",
      },
    ],
  },
  {
    topicName: "Linux File System",
    concept: "The /tmp directory and its security implications",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is the /tmp directory a common target for attackers on Linux systems?",
        choices: [
          "It stores encrypted user passwords",
          "It is world-writable, allowing any user to create and execute files there",
          "It contains kernel modules that can be replaced",
          "It holds backup copies of the /etc/shadow file",
        ],
        correctAnswer:
          "It is world-writable, allowing any user to create and execute files there",
        explanation:
          "The /tmp directory is world-writable by default, meaning any user can create files in it. Attackers often use /tmp to drop malicious payloads, scripts, or tools after gaining initial access. Mounting /tmp with noexec can mitigate this risk.",
      },
    ],
  },
  {
    topicName: "Linux File System",
    concept: "The /proc filesystem and process information",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What type of filesystem is /proc in Linux?",
        choices: [
          "A standard ext4 filesystem for storing process binaries",
          "A virtual filesystem that exposes kernel and process information",
          "An encrypted filesystem for storing sensitive process data",
          "A network filesystem for sharing process information across hosts",
        ],
        correctAnswer:
          "A virtual filesystem that exposes kernel and process information",
        explanation:
          "The /proc filesystem is a virtual (pseudo) filesystem that does not exist on disk. It provides an interface to kernel data structures and per-process information. Analysts use files like /proc/[pid]/cmdline and /proc/[pid]/maps for live forensics.",
      },
    ],
  },
  {
    topicName: "Linux File System",
    concept: "Hard links vs symbolic links",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the key difference between a hard link and a symbolic (soft) link in Linux?",
        choices: [
          "A hard link points directly to the inode of a file; a symbolic link points to the file path",
          "A symbolic link can only reference directories; a hard link cannot",
          "Hard links work across different filesystems; symbolic links do not",
          "Symbolic links share the same inode number as the target file",
        ],
        correctAnswer:
          "A hard link points directly to the inode of a file; a symbolic link points to the file path",
        explanation:
          "A hard link is an additional directory entry pointing to the same inode as the original file. A symbolic link is a separate file that stores the path to the target. Deleting the original file breaks a symbolic link but does not affect a hard link.",
      },
    ],
  },
  {
    topicName: "Linux File System",
    concept: "The /home directory and user data",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Where are individual user home directories typically located on a Linux system?",
        choices: [
          "/usr/home",
          "/home",
          "/users",
          "/var/users",
        ],
        correctAnswer: "/home",
        explanation:
          "User home directories are typically stored under /home (e.g., /home/alice). Each user's home directory contains personal files, shell configuration files like .bashrc and .bash_history, and SSH keys in .ssh/, all of which are valuable to attackers.",
      },
    ],
  },
  {
    topicName: "Linux File System",
    concept: "The /bin and /sbin directories",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary difference between /bin and /sbin on a Linux system?",
        choices: [
          "/bin contains user commands; /sbin contains system administration commands typically requiring root privileges",
          "/sbin is for shell scripts; /bin is for compiled binaries",
          "/bin is for 32-bit binaries; /sbin is for 64-bit binaries",
          "/sbin stores backup copies of /bin executables",
        ],
        correctAnswer:
          "/bin contains user commands; /sbin contains system administration commands typically requiring root privileges",
        explanation:
          "/bin holds essential user commands available to all users (ls, cp, cat), while /sbin holds system administration binaries (iptables, fdisk, ifconfig) that typically require root privileges. On modern systems, these are often symlinked to /usr/bin and /usr/sbin.",
      },
    ],
  },
  {
    topicName: "Linux File System",
    concept: "Inodes and file metadata",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What information does an inode store in a Linux filesystem?",
        choices: [
          "The filename and its directory path",
          "File metadata including ownership, permissions, timestamps, and data block pointers",
          "Only the file contents in compressed form",
          "The user's password hash associated with the file",
        ],
        correctAnswer:
          "File metadata including ownership, permissions, timestamps, and data block pointers",
        explanation:
          "An inode stores metadata about a file: owner, group, permissions, timestamps (access, modification, change), file size, and pointers to the data blocks on disk. Notably, the filename is not stored in the inode but in the directory entry.",
      },
    ],
  },
  {
    topicName: "Linux File System",
    concept: "Common Linux filesystem types (ext4, XFS, Btrfs)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which filesystem is the default on most modern Linux distributions?",
        choices: [
          "NTFS",
          "FAT32",
          "ext4",
          "HFS+",
        ],
        correctAnswer: "ext4",
        explanation:
          "ext4 (Fourth Extended Filesystem) is the default filesystem on most Linux distributions. It supports journaling for crash recovery, file sizes up to 16 TiB, and volumes up to 1 EiB. XFS and Btrfs are also common alternatives.",
      },
    ],
  },
  {
    topicName: "Linux File System",
    concept: "The /dev directory and device files",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the /dev directory contain in Linux?",
        choices: [
          "Development tools and compilers",
          "Device files that represent hardware and virtual devices",
          "Developer documentation and man pages",
          "Temporary files created by development environments",
        ],
        correctAnswer:
          "Device files that represent hardware and virtual devices",
        explanation:
          "The /dev directory contains special device files that represent hardware devices (e.g., /dev/sda for a hard disk) and virtual devices (e.g., /dev/null, /dev/random). In security contexts, /dev/null discards output and /dev/urandom provides cryptographic randomness.",
      },
    ],
  },
  {
    topicName: "Linux File System",
    concept: "Mount points and the /etc/fstab file",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of the /etc/fstab file on a Linux system?",
        choices: [
          "It stores user account information",
          "It defines filesystems to be automatically mounted at boot, including their mount points and options",
          "It lists all currently running processes",
          "It configures the system firewall rules",
        ],
        correctAnswer:
          "It defines filesystems to be automatically mounted at boot, including their mount points and options",
        explanation:
          "The /etc/fstab (filesystem table) file defines which filesystems are mounted automatically at boot and their options (e.g., noexec, nosuid, nodev). Proper fstab hardening is important for security, such as mounting /tmp with noexec to prevent execution of malicious files.",
      },
    ],
  },
  {
    topicName: "Linux File System",
    concept: "The /usr directory and user programs",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the /usr directory hierarchy contain in Linux?",
        choices: [
          "User home directories and personal files",
          "Read-only user programs, libraries, documentation, and shared resources",
          "Temporary user session data",
          "User-specific log files",
        ],
        correctAnswer:
          "Read-only user programs, libraries, documentation, and shared resources",
        explanation:
          "/usr (Unix System Resources) contains read-only user programs and data: /usr/bin for user commands, /usr/lib for libraries, /usr/share for architecture-independent data, and /usr/local for locally installed software. It is the largest directory hierarchy on most systems.",
      },
    ],
  },

  // =======================================================================
  // Linux Permissions (13 nodes)
  // =======================================================================
  {
    topicName: "Linux Permissions",
    concept: "The three permission categories: owner, group, other",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In Linux file permissions, what are the three categories of users that permissions apply to?",
        choices: [
          "Admin, User, Guest",
          "Owner, Group, Other",
          "Root, Sudo, Normal",
          "Read, Write, Execute",
        ],
        correctAnswer: "Owner, Group, Other",
        explanation:
          "Linux file permissions are divided into three categories: Owner (the file's owner), Group (members of the file's group), and Other (everyone else). Each category can independently have read, write, and execute permissions.",
      },
    ],
  },
  {
    topicName: "Linux Permissions",
    concept: "Numeric (octal) permission notation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In Linux octal permission notation, what does the permission value 755 represent?",
        choices: [
          "Owner: read/write, Group: read, Other: none",
          "Owner: read/write/execute, Group: read/execute, Other: read/execute",
          "Owner: read/write/execute, Group: read/write, Other: read/write",
          "Owner: read/execute, Group: write, Other: execute",
        ],
        correctAnswer:
          "Owner: read/write/execute, Group: read/execute, Other: read/execute",
        explanation:
          "In octal notation, 7 = read(4) + write(2) + execute(1), and 5 = read(4) + execute(1). So 755 gives the owner full permissions (rwx) and grants group and other read and execute permissions (r-x).",
      },
    ],
  },
  {
    topicName: "Linux Permissions",
    concept: "The chmod command for changing permissions",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which command is used to change file permissions on a Linux system?",
        choices: [
          "chown",
          "chmod",
          "chgrp",
          "umask",
        ],
        correctAnswer: "chmod",
        explanation:
          "The chmod (change mode) command modifies file permissions. It can use symbolic notation (chmod u+x file) or octal notation (chmod 755 file). Misconfigured permissions are a common security vulnerability.",
      },
    ],
  },
  {
    topicName: "Linux Permissions",
    concept: "The SUID bit and its security implications",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the SUID (Set User ID) bit do when set on an executable file in Linux?",
        choices: [
          "It prevents the file from being executed by non-root users",
          "It causes the file to execute with the permissions of the file owner, regardless of who runs it",
          "It encrypts the file so only the owner can read it",
          "It logs all executions of the file to the system audit log",
        ],
        correctAnswer:
          "It causes the file to execute with the permissions of the file owner, regardless of who runs it",
        explanation:
          "When the SUID bit is set on an executable, it runs with the effective permissions of the file owner (often root) instead of the user who launched it. Finding SUID binaries (find / -perm -4000) is a key step in Linux privilege escalation.",
      },
    ],
  },
  {
    topicName: "Linux Permissions",
    concept: "The SGID bit on files and directories",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the effect of the SGID (Set Group ID) bit when applied to a directory?",
        choices: [
          "Files created within the directory inherit the directory's group ownership",
          "Only the group owner can list the directory contents",
          "The directory becomes read-only for all group members",
          "The directory is excluded from backup operations",
        ],
        correctAnswer:
          "Files created within the directory inherit the directory's group ownership",
        explanation:
          "When SGID is set on a directory, new files and subdirectories created within it inherit the group ownership of the parent directory rather than the creating user's primary group. This is useful for shared directories.",
      },
    ],
  },
  {
    topicName: "Linux Permissions",
    concept: "The sticky bit on directories",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the sticky bit do when set on a directory like /tmp?",
        choices: [
          "It makes the directory hidden from non-root users",
          "It allows only the file owner, directory owner, or root to delete or rename files within it",
          "It compresses all files stored in the directory",
          "It prevents any new files from being created in the directory",
        ],
        correctAnswer:
          "It allows only the file owner, directory owner, or root to delete or rename files within it",
        explanation:
          "The sticky bit on a directory prevents users from deleting or renaming files owned by other users. This is essential for world-writable directories like /tmp, where without the sticky bit any user could delete any other user's files.",
      },
    ],
  },
  {
    topicName: "Linux Permissions",
    concept: "The umask and default file permissions",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the umask value control on a Linux system?",
        choices: [
          "The maximum number of files a user can create",
          "The default permissions that are removed from newly created files and directories",
          "The encryption algorithm used for file storage",
          "The list of users who are denied login access",
        ],
        correctAnswer:
          "The default permissions that are removed from newly created files and directories",
        explanation:
          "The umask is a bitmask that is subtracted from the system default permissions when creating new files and directories. For example, a umask of 022 removes write permission for group and other from new files, resulting in 644 for files and 755 for directories.",
      },
    ],
  },
  {
    topicName: "Linux Permissions",
    concept: "The chown command for changing ownership",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the chown command do in Linux?",
        choices: [
          "Changes the permissions (mode) of a file",
          "Changes the owner and/or group of a file or directory",
          "Changes the timestamp of a file",
          "Changes the name of a file or directory",
        ],
        correctAnswer:
          "Changes the owner and/or group of a file or directory",
        explanation:
          "The chown (change owner) command modifies the owner and optionally the group of a file or directory (e.g., chown alice:developers file.txt). Only root can change file ownership on most systems.",
      },
    ],
  },
  {
    topicName: "Linux Permissions",
    concept: "The /etc/passwd file and user accounts",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What information is stored in the /etc/passwd file on a Linux system?",
        choices: [
          "Encrypted user passwords and their expiration dates",
          "User account information including username, UID, GID, home directory, and default shell",
          "A log of all successful and failed login attempts",
          "The list of users currently logged into the system",
        ],
        correctAnswer:
          "User account information including username, UID, GID, home directory, and default shell",
        explanation:
          "The /etc/passwd file contains one line per user account with colon-separated fields: username, password placeholder (x), UID, GID, comment, home directory, and login shell. Despite its name, actual password hashes are stored in /etc/shadow.",
      },
    ],
  },
  {
    topicName: "Linux Permissions",
    concept: "The /etc/shadow file and password hashes",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why are password hashes stored in /etc/shadow rather than /etc/passwd?",
        choices: [
          "Because /etc/shadow supports longer passwords",
          "Because /etc/shadow is readable only by root, protecting password hashes from non-privileged users",
          "Because /etc/passwd does not support any form of encryption",
          "Because /etc/shadow automatically rotates passwords every 90 days",
        ],
        correctAnswer:
          "Because /etc/shadow is readable only by root, protecting password hashes from non-privileged users",
        explanation:
          "The /etc/shadow file is readable only by root (permissions 640 or 600), whereas /etc/passwd must be world-readable for system functionality. Moving password hashes to /etc/shadow prevents unprivileged users from obtaining hashes for offline cracking.",
      },
    ],
  },
  {
    topicName: "Linux Permissions",
    concept: "The sudo command and privilege escalation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of the sudo command in Linux?",
        choices: [
          "To switch to a different user's home directory",
          "To execute a command with the privileges of another user, typically root",
          "To encrypt a command before execution",
          "To schedule a command to run at a later time",
        ],
        correctAnswer:
          "To execute a command with the privileges of another user, typically root",
        explanation:
          "sudo (superuser do) allows authorized users to run commands as root or another user, as configured in /etc/sudoers. Misconfigured sudo rules are a top target for privilege escalation attacks on Linux systems.",
      },
    ],
  },
  {
    topicName: "Linux Permissions",
    concept: "The /etc/sudoers file and sudo configuration",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which file controls which users and groups are permitted to use sudo, and what commands they may run?",
        choices: [
          "/etc/passwd",
          "/etc/sudo.conf",
          "/etc/sudoers",
          "/etc/security/access.conf",
        ],
        correctAnswer: "/etc/sudoers",
        explanation:
          "The /etc/sudoers file defines sudo policies: which users or groups may run which commands, on which hosts, and as which target users. It should only be edited with the visudo command, which validates syntax before saving.",
      },
    ],
  },
  {
    topicName: "Linux Permissions",
    concept: "Access Control Lists (ACLs) in Linux",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What do Linux Access Control Lists (ACLs) provide beyond standard file permissions?",
        choices: [
          "The ability to encrypt individual files at the filesystem level",
          "Fine-grained permission control for specific users and groups beyond owner/group/other",
          "Automatic permission inheritance from parent directories only",
          "A mechanism to prevent root from accessing certain files",
        ],
        correctAnswer:
          "Fine-grained permission control for specific users and groups beyond owner/group/other",
        explanation:
          "Linux ACLs extend the traditional owner/group/other model by allowing permissions to be set for additional named users and groups on a per-file basis. The getfacl and setfacl commands manage ACLs.",
      },
    ],
  },

  // =======================================================================
  // Linux Processes (13 nodes)
  // =======================================================================
  {
    topicName: "Linux Processes",
    concept: "The init/systemd process (PID 1)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which process always has PID 1 on a Linux system and is the ancestor of all other processes?",
        choices: [
          "bash",
          "kernel",
          "init or systemd",
          "cron",
        ],
        correctAnswer: "init or systemd",
        explanation:
          "The init process (or systemd on modern distributions) is the first user-space process started by the kernel and always has PID 1. It is the ancestor of all other processes and is responsible for starting and managing system services.",
      },
    ],
  },
  {
    topicName: "Linux Processes",
    concept: "The ps command for viewing processes",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which command is commonly used to display a snapshot of currently running processes on a Linux system?",
        choices: [
          "ls -l",
          "ps aux",
          "df -h",
          "cat /proc/cpuinfo",
        ],
        correctAnswer: "ps aux",
        explanation:
          "The 'ps aux' command displays a snapshot of all running processes with detailed information including user, PID, CPU usage, memory usage, and the command line. It is essential for security investigations and identifying suspicious processes.",
      },
    ],
  },
  {
    topicName: "Linux Processes",
    concept: "Process signals and the kill command",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the command 'kill -9 <PID>' do in Linux?",
        choices: [
          "Sends SIGHUP to gracefully restart the process",
          "Sends SIGKILL to forcefully terminate the process immediately",
          "Sends SIGSTOP to pause the process",
          "Sends SIGTERM to request a graceful shutdown",
        ],
        correctAnswer:
          "Sends SIGKILL to forcefully terminate the process immediately",
        explanation:
          "Signal 9 (SIGKILL) cannot be caught or ignored by a process; the kernel immediately terminates it. Unlike SIGTERM (signal 15), which allows a process to clean up before exiting, SIGKILL is a last resort when a process is unresponsive.",
      },
    ],
  },
  {
    topicName: "Linux Processes",
    concept: "Foreground and background processes",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In a Linux shell, how do you send a running foreground process to the background?",
        choices: [
          "Press Ctrl+C, then type bg",
          "Press Ctrl+Z to suspend it, then type bg",
          "Type 'background' followed by the PID",
          "Press Ctrl+D to detach the process",
        ],
        correctAnswer:
          "Press Ctrl+Z to suspend it, then type bg",
        explanation:
          "Ctrl+Z sends SIGTSTP to the foreground process, suspending it. The 'bg' command then resumes it in the background. The 'fg' command brings a background process back to the foreground. The '&' suffix starts a command directly in the background.",
      },
    ],
  },
  {
    topicName: "Linux Processes",
    concept: "Daemons and background services",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a daemon in the context of Linux systems?",
        choices: [
          "A malicious process that hides from the user",
          "A background process that runs continuously, typically providing a system service",
          "A process that only runs when a user is logged in",
          "A kernel module that manages hardware devices",
        ],
        correctAnswer:
          "A background process that runs continuously, typically providing a system service",
        explanation:
          "A daemon is a background process that runs without direct user interaction, typically started at boot to provide services such as web serving (httpd), logging (syslogd), or SSH access (sshd). Daemon names conventionally end with 'd'.",
      },
    ],
  },
  {
    topicName: "Linux Processes",
    concept: "The /proc filesystem for process inspection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How can you view the exact command line used to start a process with PID 1234 on Linux?",
        choices: [
          "cat /var/log/process/1234",
          "cat /proc/1234/cmdline",
          "cat /etc/process/1234.conf",
          "cat /sys/process/1234/cmd",
        ],
        correctAnswer: "cat /proc/1234/cmdline",
        explanation:
          "The /proc/[pid]/cmdline file contains the complete command line used to start a process, with arguments separated by null bytes. This is invaluable during incident response for understanding what a suspicious process is doing.",
      },
    ],
  },
  {
    topicName: "Linux Processes",
    concept: "Process niceness and priority",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the 'nice' value of a Linux process control?",
        choices: [
          "The amount of memory allocated to the process",
          "The CPU scheduling priority of the process",
          "The network bandwidth available to the process",
          "The file access permissions of the process",
        ],
        correctAnswer: "The CPU scheduling priority of the process",
        explanation:
          "The nice value ranges from -20 (highest priority) to 19 (lowest priority). A higher nice value means the process is 'nicer' to other processes by yielding CPU time. Only root can set negative nice values (higher priority).",
      },
    ],
  },
  {
    topicName: "Linux Processes",
    concept: "Zombie processes and process states",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a zombie process in Linux?",
        choices: [
          "A process that consumes excessive CPU resources",
          "A process that has completed execution but still has an entry in the process table because its parent has not collected its exit status",
          "A process that has been suspended by the kernel for security reasons",
          "A process running in a container that has lost its network connection",
        ],
        correctAnswer:
          "A process that has completed execution but still has an entry in the process table because its parent has not collected its exit status",
        explanation:
          "A zombie process has finished executing but remains in the process table (state 'Z') until its parent calls wait() to read its exit status. Zombies consume minimal resources but a large number may indicate a poorly written or compromised parent process.",
      },
    ],
  },
  {
    topicName: "Linux Processes",
    concept: "The top and htop commands for real-time monitoring",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the 'top' command display in Linux?",
        choices: [
          "A list of the top 10 largest files on the system",
          "A real-time, dynamic view of running processes and system resource utilization",
          "The top-level directory structure of the filesystem",
          "A list of the most recently modified configuration files",
        ],
        correctAnswer:
          "A real-time, dynamic view of running processes and system resource utilization",
        explanation:
          "The 'top' command provides a real-time, updating display of system processes sorted by CPU usage, along with overall CPU, memory, and swap utilization. It is commonly used during incident response to identify resource-intensive or suspicious processes.",
      },
    ],
  },
  {
    topicName: "Linux Processes",
    concept: "The cron scheduler and crontab",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of cron on a Linux system?",
        choices: [
          "To monitor system logs for security events",
          "To schedule commands or scripts to run automatically at specified times or intervals",
          "To manage user authentication and session tracking",
          "To compress and archive old files",
        ],
        correctAnswer:
          "To schedule commands or scripts to run automatically at specified times or intervals",
        explanation:
          "Cron is a time-based job scheduler that executes commands at specified intervals defined in crontab files. Attackers frequently install cron jobs for persistence, so reviewing crontabs (crontab -l, /etc/crontab, /etc/cron.d/) is essential during investigations.",
      },
    ],
  },
  {
    topicName: "Linux Processes",
    concept: "Process namespaces and containerization",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What do Linux namespaces provide in the context of process isolation?",
        choices: [
          "Encryption of process memory to prevent reading by other processes",
          "Isolated views of system resources such as PIDs, network, and mount points for groups of processes",
          "A mechanism to run processes on remote machines transparently",
          "Automatic load balancing of processes across CPU cores",
        ],
        correctAnswer:
          "Isolated views of system resources such as PIDs, network, and mount points for groups of processes",
        explanation:
          "Linux namespaces isolate groups of processes so they have their own view of system resources (PID, network, mount, user, UTS, IPC). Namespaces are the foundational technology behind containers like Docker and are critical to understanding container security.",
      },
    ],
  },
  {
    topicName: "Linux Processes",
    concept: "The lsof command for listing open files",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the lsof command do in Linux, and why is it useful for security?",
        choices: [
          "It lists all files on the filesystem sorted by size",
          "It lists open files and the processes that have them open, including network connections",
          "It locks files to prevent simultaneous access by multiple users",
          "It logs all file system operations to the audit log",
        ],
        correctAnswer:
          "It lists open files and the processes that have them open, including network connections",
        explanation:
          "lsof (list open files) shows all files currently opened by processes, including regular files, directories, network sockets, and pipes. It is invaluable for identifying which process is using a port (lsof -i :80) or which files a suspicious process has open.",
      },
    ],
  },
  {
    topicName: "Linux Processes",
    concept: "The strace command for system call tracing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the strace utility do in Linux?",
        choices: [
          "It traces network packets between two hosts",
          "It intercepts and records system calls made by a process and the signals it receives",
          "It traces the execution path through source code",
          "It monitors disk I/O operations at the block device level",
        ],
        correctAnswer:
          "It intercepts and records system calls made by a process and the signals it receives",
        explanation:
          "strace traces system calls (open, read, write, connect, execve, etc.) made by a process. Security analysts use it to understand malware behavior, debug suspicious processes, and observe what files and network connections a program accesses.",
      },
    ],
  },

  // =======================================================================
  // Linux Networking (13 nodes)
  // =======================================================================
  {
    topicName: "Linux Networking",
    concept: "The ifconfig and ip commands for network configuration",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which modern command has replaced ifconfig for network interface configuration on most Linux distributions?",
        choices: [
          "netstat",
          "ip",
          "route",
          "nmcli",
        ],
        correctAnswer: "ip",
        explanation:
          "The 'ip' command (from iproute2) has replaced the deprecated ifconfig for configuring network interfaces, routes, and addresses. Use 'ip addr' to show addresses, 'ip link' for interfaces, and 'ip route' for routing tables.",
      },
    ],
  },
  {
    topicName: "Linux Networking",
    concept: "The netstat and ss commands for network connections",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which command is the modern replacement for netstat that displays socket statistics on Linux?",
        choices: [
          "nmap",
          "ss",
          "dig",
          "traceroute",
        ],
        correctAnswer: "ss",
        explanation:
          "The 'ss' command (socket statistics) replaces the deprecated netstat for displaying network connections, listening ports, and socket information. 'ss -tulnp' shows all TCP/UDP listening ports with process information, which is essential for identifying unauthorized services.",
      },
    ],
  },
  {
    topicName: "Linux Networking",
    concept: "iptables and Linux firewall management",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is iptables in Linux?",
        choices: [
          "A tool for managing DNS records",
          "A user-space utility for configuring the kernel's packet filtering rules (firewall)",
          "A network monitoring tool that captures packets",
          "A service that assigns IP addresses via DHCP",
        ],
        correctAnswer:
          "A user-space utility for configuring the kernel's packet filtering rules (firewall)",
        explanation:
          "iptables is the traditional user-space tool for configuring the Linux kernel's Netfilter packet filtering framework. It organizes rules into chains (INPUT, OUTPUT, FORWARD) within tables (filter, nat, mangle). nftables is its modern successor.",
      },
    ],
  },
  {
    topicName: "Linux Networking",
    concept: "The /etc/hosts file and local name resolution",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What role does the /etc/hosts file play on a Linux system?",
        choices: [
          "It configures the DHCP client settings",
          "It provides static hostname-to-IP address mappings that override DNS",
          "It stores the SSH known_hosts keys",
          "It lists all network interfaces and their MAC addresses",
        ],
        correctAnswer:
          "It provides static hostname-to-IP address mappings that override DNS",
        explanation:
          "The /etc/hosts file maps hostnames to IP addresses locally, and is typically consulted before DNS (depending on /etc/nsswitch.conf). Attackers may modify it to redirect traffic, and defenders use it to block known malicious domains by pointing them to 127.0.0.1.",
      },
    ],
  },
  {
    topicName: "Linux Networking",
    concept: "SSH key-based authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Where is the default location for storing a user's authorized SSH public keys on a Linux server?",
        choices: [
          "/etc/ssh/authorized_keys",
          "~/.ssh/authorized_keys",
          "/var/ssh/keys",
          "/home/ssh/public_keys",
        ],
        correctAnswer: "~/.ssh/authorized_keys",
        explanation:
          "The ~/.ssh/authorized_keys file in each user's home directory lists the public keys allowed to authenticate as that user. Attackers who gain write access to this file can add their own key for persistent backdoor access.",
      },
    ],
  },
  {
    topicName: "Linux Networking",
    concept: "The tcpdump command for packet capture",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is tcpdump used for in Linux?",
        choices: [
          "Dumping the contents of TCP configuration files",
          "Capturing and analyzing network packets on an interface",
          "Testing TCP connection speeds between two hosts",
          "Displaying the TCP connection table",
        ],
        correctAnswer:
          "Capturing and analyzing network packets on an interface",
        explanation:
          "tcpdump is a command-line packet analyzer that captures and displays network packets passing through an interface. It is commonly used for network troubleshooting and security analysis (e.g., 'tcpdump -i eth0 port 443' captures HTTPS traffic).",
      },
    ],
  },
  {
    topicName: "Linux Networking",
    concept: "The /etc/resolv.conf file and DNS resolver configuration",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the /etc/resolv.conf file configure on a Linux system?",
        choices: [
          "The system's firewall resolution rules",
          "The DNS name servers and search domains used for name resolution",
          "The list of resolved security vulnerabilities",
          "The hostname resolution order for NIS and LDAP",
        ],
        correctAnswer:
          "The DNS name servers and search domains used for name resolution",
        explanation:
          "The /etc/resolv.conf file specifies the DNS servers (nameserver entries) and default search domains used by the system's resolver library. An attacker who modifies this file can redirect all DNS queries to a malicious server.",
      },
    ],
  },
  {
    topicName: "Linux Networking",
    concept: "The nmap port scanner and its uses",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary purpose of the nmap tool?",
        choices: [
          "Managing network interface IP addresses",
          "Network discovery and security auditing through port scanning",
          "Monitoring network bandwidth usage in real time",
          "Configuring VPN tunnels between networks",
        ],
        correctAnswer:
          "Network discovery and security auditing through port scanning",
        explanation:
          "nmap (Network Mapper) is an open-source tool for network discovery and security auditing. It can identify open ports, running services, operating system versions, and potential vulnerabilities on target hosts. It is used by both defenders and attackers.",
      },
    ],
  },
  {
    topicName: "Linux Networking",
    concept: "Network bonding and interface teaming",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of network interface bonding (teaming) in Linux?",
        choices: [
          "Encrypting traffic across multiple interfaces simultaneously",
          "Combining multiple network interfaces for redundancy and/or increased throughput",
          "Assigning multiple IP addresses to a single interface",
          "Bridging traffic between wired and wireless interfaces",
        ],
        correctAnswer:
          "Combining multiple network interfaces for redundancy and/or increased throughput",
        explanation:
          "Network bonding (or teaming) aggregates multiple physical network interfaces into a single logical interface. It provides fault tolerance (if one link fails, traffic continues on another) and can increase bandwidth through load balancing across links.",
      },
    ],
  },
  {
    topicName: "Linux Networking",
    concept: "The curl and wget commands for HTTP requests",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which command-line tool is commonly used to transfer data from or to a server using URLs and supports protocols like HTTP, HTTPS, and FTP?",
        choices: [
          "dig",
          "curl",
          "arp",
          "traceroute",
        ],
        correctAnswer: "curl",
        explanation:
          "curl (Client URL) is a versatile command-line tool for transferring data using various protocols. Security professionals use it to test web applications, download payloads, and interact with REST APIs. wget is a similar tool focused on downloading files.",
      },
    ],
  },
  {
    topicName: "Linux Networking",
    concept: "The /etc/network/interfaces and NetworkManager",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "On Debian-based Linux systems, which file traditionally defines persistent network interface configurations?",
        choices: [
          "/etc/sysconfig/network-scripts/ifcfg-eth0",
          "/etc/network/interfaces",
          "/etc/netplan/config.yaml",
          "/etc/NetworkManager/system-connections/",
        ],
        correctAnswer: "/etc/network/interfaces",
        explanation:
          "On Debian/Ubuntu systems, /etc/network/interfaces defines persistent network configurations including IP addresses, gateways, and DNS settings. Modern Ubuntu uses Netplan (/etc/netplan/) which generates configurations for NetworkManager or systemd-networkd.",
      },
    ],
  },
  {
    topicName: "Linux Networking",
    concept: "VPN and tunneling on Linux (OpenVPN, WireGuard)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which modern VPN protocol is known for its simplicity, high performance, and small codebase, making it increasingly popular on Linux?",
        choices: [
          "PPTP",
          "L2TP/IPsec",
          "WireGuard",
          "SSTP",
        ],
        correctAnswer: "WireGuard",
        explanation:
          "WireGuard is a modern VPN protocol built into the Linux kernel since version 5.6. Its small codebase (~4,000 lines vs. OpenVPN's ~100,000) makes it easier to audit for security vulnerabilities, and it provides excellent performance with state-of-the-art cryptography.",
      },
    ],
  },
  {
    topicName: "Linux Networking",
    concept: "The dig command for DNS queries",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the dig command used for in Linux?",
        choices: [
          "Discovering open ports on a remote host",
          "Performing DNS lookups and querying DNS servers for specific record types",
          "Digging into filesystem metadata to find hidden files",
          "Monitoring disk I/O operations",
        ],
        correctAnswer:
          "Performing DNS lookups and querying DNS servers for specific record types",
        explanation:
          "dig (Domain Information Groper) is a flexible DNS lookup tool used to query DNS servers for specific record types (A, MX, NS, TXT, etc.). Security professionals use it to investigate DNS configurations, detect misconfigurations, and verify DNSSEC signatures.",
      },
    ],
  },

  // =======================================================================
  // Windows Architecture (13 nodes)
  // =======================================================================
  {
    topicName: "Windows Architecture",
    concept: "The Windows Registry and its structure",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the Windows Registry?",
        choices: [
          "A log file that records all system events",
          "A hierarchical database that stores configuration settings for the operating system, applications, and users",
          "A tool for managing Windows services",
          "A file system used exclusively for storing system DLLs",
        ],
        correctAnswer:
          "A hierarchical database that stores configuration settings for the operating system, applications, and users",
        explanation:
          "The Windows Registry is a hierarchical database organized into hives (HKEY_LOCAL_MACHINE, HKEY_CURRENT_USER, etc.) that stores OS configuration, application settings, and user preferences. Malware frequently modifies registry keys for persistence.",
      },
    ],
  },
  {
    topicName: "Windows Architecture",
    concept: "Registry hives: HKLM and HKCU",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the HKEY_LOCAL_MACHINE (HKLM) registry hive contain?",
        choices: [
          "Settings specific to the currently logged-in user",
          "System-wide configuration settings that apply to all users on the machine",
          "Temporary files and cached application data",
          "Network connection logs and firewall rules",
        ],
        correctAnswer:
          "System-wide configuration settings that apply to all users on the machine",
        explanation:
          "HKEY_LOCAL_MACHINE (HKLM) contains system-wide settings including hardware configuration, installed software, and security policies. HKEY_CURRENT_USER (HKCU) contains settings for the currently logged-in user. Both are key targets for forensic analysis.",
      },
    ],
  },
  {
    topicName: "Windows Architecture",
    concept: "The Windows kernel and user mode vs. kernel mode",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the fundamental difference between user mode and kernel mode in Windows?",
        choices: [
          "User mode is for graphical applications; kernel mode is for command-line tools",
          "User mode code has restricted access to hardware and system resources; kernel mode code has unrestricted access",
          "User mode runs only 32-bit applications; kernel mode runs 64-bit applications",
          "There is no difference; they are alternate names for the same execution context",
        ],
        correctAnswer:
          "User mode code has restricted access to hardware and system resources; kernel mode code has unrestricted access",
        explanation:
          "User mode processes run in an isolated virtual address space with restricted access to system resources. Kernel mode code (drivers, kernel) has unrestricted access to all hardware and memory. A vulnerability in kernel mode code can compromise the entire system.",
      },
    ],
  },
  {
    topicName: "Windows Architecture",
    concept: "Windows services and the Service Control Manager",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What manages the lifecycle of Windows services (starting, stopping, and configuring)?",
        choices: [
          "Task Manager",
          "Service Control Manager (SCM)",
          "Windows Defender",
          "Group Policy Editor",
        ],
        correctAnswer: "Service Control Manager (SCM)",
        explanation:
          "The Service Control Manager (SCM) manages Windows services, handling start, stop, pause, and configuration operations. Services run in the background, often with SYSTEM privileges, making them attractive targets for attackers seeking persistent access.",
      },
    ],
  },
  {
    topicName: "Windows Architecture",
    concept: "The Windows Task Manager and process monitoring",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which Windows tool provides a real-time view of running processes, CPU usage, memory consumption, and network activity?",
        choices: [
          "Registry Editor (regedit)",
          "Device Manager",
          "Task Manager",
          "Disk Management",
        ],
        correctAnswer: "Task Manager",
        explanation:
          "Windows Task Manager (Ctrl+Shift+Esc) displays running processes, performance metrics, startup programs, and services. Security analysts use it as a first-pass tool to identify suspicious processes, though Process Explorer from Sysinternals provides deeper analysis.",
      },
    ],
  },
  {
    topicName: "Windows Architecture",
    concept: "The NTFS file system and its features",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which feature of the NTFS file system allows files to contain hidden data streams that are not visible through normal directory listings?",
        choices: [
          "Journaling",
          "Alternate Data Streams (ADS)",
          "Disk quotas",
          "File compression",
        ],
        correctAnswer: "Alternate Data Streams (ADS)",
        explanation:
          "NTFS Alternate Data Streams (ADS) allow additional named data streams to be attached to a file without changing its apparent size or content. Malware can hide payloads in ADS, making detection more difficult. Use 'dir /r' or Sysinternals Streams to detect them.",
      },
    ],
  },
  {
    topicName: "Windows Architecture",
    concept: "DLLs (Dynamic Link Libraries) and DLL hijacking",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is DLL hijacking in Windows?",
        choices: [
          "Encrypting DLL files to prevent unauthorized use",
          "Placing a malicious DLL in a location where a legitimate application will load it instead of the intended DLL",
          "Removing DLL files to cause application crashes",
          "Replacing the Windows DLL cache with outdated versions",
        ],
        correctAnswer:
          "Placing a malicious DLL in a location where a legitimate application will load it instead of the intended DLL",
        explanation:
          "DLL hijacking exploits the Windows DLL search order. When an application loads a DLL without specifying a full path, Windows searches several directories in order. An attacker can place a malicious DLL with the same name in a higher-priority search path.",
      },
    ],
  },
  {
    topicName: "Windows Architecture",
    concept: "Windows boot process and Secure Boot",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary security function of UEFI Secure Boot in Windows?",
        choices: [
          "Encrypting the entire hard drive during startup",
          "Verifying that only trusted, digitally signed boot components are loaded during startup",
          "Preventing users from changing BIOS settings",
          "Scanning for malware in memory before the OS loads",
        ],
        correctAnswer:
          "Verifying that only trusted, digitally signed boot components are loaded during startup",
        explanation:
          "UEFI Secure Boot verifies the digital signatures of bootloaders, drivers, and OS kernels before executing them. This protects against bootkits and rootkits that attempt to load malicious code before the operating system's security controls are active.",
      },
    ],
  },
  {
    topicName: "Windows Architecture",
    concept: "The Windows command prompt (cmd.exe) vs PowerShell",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is PowerShell considered more powerful than the traditional Windows Command Prompt (cmd.exe)?",
        choices: [
          "PowerShell can only run on Windows Server, while cmd.exe runs on all Windows versions",
          "PowerShell is object-oriented, has access to .NET framework, and can manage virtually all Windows components",
          "PowerShell executes commands faster than cmd.exe",
          "PowerShell has a graphical interface while cmd.exe does not",
        ],
        correctAnswer:
          "PowerShell is object-oriented, has access to .NET framework, and can manage virtually all Windows components",
        explanation:
          "PowerShell works with objects rather than text, has full access to .NET and COM, and provides cmdlets for managing every aspect of Windows. Its power also makes it a favorite tool for attackers (living-off-the-land techniques).",
      },
    ],
  },
  {
    topicName: "Windows Architecture",
    concept: "The Windows Event Log and its categories",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which Windows component records system events, security audit events, and application events for troubleshooting and forensic analysis?",
        choices: [
          "Windows Defender",
          "Windows Event Log",
          "Windows Firewall",
          "Windows Update",
        ],
        correctAnswer: "Windows Event Log",
        explanation:
          "The Windows Event Log records events in categories including Application, Security, System, and Setup. Security events (logon attempts, privilege use, policy changes) are critical for forensic investigations and are accessible via Event Viewer or PowerShell.",
      },
    ],
  },
  {
    topicName: "Windows Architecture",
    concept: "The Windows file system structure (C:\\Windows, C:\\Users)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which directory in a standard Windows installation contains the operating system files, including system32?",
        choices: [
          "C:\\Program Files",
          "C:\\Users",
          "C:\\Windows",
          "C:\\System",
        ],
        correctAnswer: "C:\\Windows",
        explanation:
          "C:\\Windows contains the OS core files, including the critical C:\\Windows\\System32 directory which holds system executables, DLLs, and drivers. C:\\Users contains user profiles, and C:\\Program Files holds installed applications.",
      },
    ],
  },
  {
    topicName: "Windows Architecture",
    concept: "WMI (Windows Management Instrumentation)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is WMI (Windows Management Instrumentation) used for?",
        choices: [
          "Managing Windows Firewall rules exclusively",
          "Querying and managing Windows system resources, hardware, and configuration remotely or locally",
          "Installing Windows updates and patches",
          "Encrypting files on NTFS volumes",
        ],
        correctAnswer:
          "Querying and managing Windows system resources, hardware, and configuration remotely or locally",
        explanation:
          "WMI provides a standardized interface for querying system information and managing Windows resources both locally and remotely. Attackers use WMI for reconnaissance, lateral movement, and persistence (WMI event subscriptions).",
      },
    ],
  },
  {
    topicName: "Windows Architecture",
    concept: "Windows Subsystem for Linux (WSL)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does Windows Subsystem for Linux (WSL) allow users to do?",
        choices: [
          "Replace the Windows kernel with the Linux kernel",
          "Run Linux binary executables natively on Windows without a traditional virtual machine",
          "Convert Windows applications to run on Linux",
          "Dual-boot between Windows and Linux from the same partition",
        ],
        correctAnswer:
          "Run Linux binary executables natively on Windows without a traditional virtual machine",
        explanation:
          "WSL enables running unmodified Linux binaries on Windows. WSL 2 uses a real Linux kernel in a lightweight VM. From a security perspective, WSL can be used by attackers to run Linux-native tools and may bypass some Windows security controls.",
      },
    ],
  },

  // =======================================================================
  // Windows Security (13 nodes)
  // =======================================================================
  {
    topicName: "Windows Security",
    concept: "User Account Control (UAC)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of User Account Control (UAC) in Windows?",
        choices: [
          "To encrypt user files with a per-account key",
          "To prompt for confirmation or credentials before allowing actions that require elevated privileges",
          "To manage user accounts and reset passwords",
          "To restrict which websites users can visit",
        ],
        correctAnswer:
          "To prompt for confirmation or credentials before allowing actions that require elevated privileges",
        explanation:
          "UAC prevents unauthorized changes by prompting for consent or credentials when an action requires administrator privileges. UAC bypass techniques are commonly used by attackers during privilege escalation on Windows systems.",
      },
    ],
  },
  {
    topicName: "Windows Security",
    concept: "Windows Defender and real-time protection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What type of security tool is Windows Defender (Microsoft Defender Antivirus)?",
        choices: [
          "A network firewall",
          "A built-in anti-malware solution providing real-time protection against viruses, spyware, and other threats",
          "A disk encryption tool",
          "A vulnerability scanner for web applications",
        ],
        correctAnswer:
          "A built-in anti-malware solution providing real-time protection against viruses, spyware, and other threats",
        explanation:
          "Microsoft Defender Antivirus is Windows' built-in anti-malware engine that provides real-time scanning, cloud-delivered protection, and behavioral analysis. Attackers often attempt to disable or evade Defender as one of their first post-exploitation steps.",
      },
    ],
  },
  {
    topicName: "Windows Security",
    concept: "BitLocker full disk encryption",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does BitLocker provide on a Windows system?",
        choices: [
          "File-level encryption for individual documents",
          "Full volume encryption to protect data at rest from unauthorized physical access",
          "Network traffic encryption between Windows hosts",
          "Email encryption for Outlook",
        ],
        correctAnswer:
          "Full volume encryption to protect data at rest from unauthorized physical access",
        explanation:
          "BitLocker encrypts entire disk volumes to protect data at rest. If a device is stolen or lost, BitLocker prevents attackers from accessing the data by booting from another OS or removing the hard drive. It typically uses TPM (Trusted Platform Module) for key management.",
      },
    ],
  },
  {
    topicName: "Windows Security",
    concept: "Windows Firewall (Windows Defender Firewall)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which Windows Firewall profile is applied when a computer is connected to a network it has not previously identified?",
        choices: [
          "Domain profile",
          "Private profile",
          "Public profile",
          "Guest profile",
        ],
        correctAnswer: "Public profile",
        explanation:
          "Windows Firewall uses three profiles: Domain (joined to Active Directory domain), Private (trusted home/work networks), and Public (untrusted networks like coffee shops). The Public profile applies the most restrictive rules by default for unknown networks.",
      },
    ],
  },
  {
    topicName: "Windows Security",
    concept: "NTLM vs. Kerberos authentication",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which authentication protocol is the preferred default in Windows Active Directory environments?",
        choices: [
          "NTLM",
          "Kerberos",
          "LDAP",
          "RADIUS",
        ],
        correctAnswer: "Kerberos",
        explanation:
          "Kerberos is the default authentication protocol in Active Directory environments, using ticket-based authentication with a Key Distribution Center (KDC). NTLM is a legacy protocol still supported for backward compatibility but is weaker and vulnerable to relay attacks.",
      },
    ],
  },
  {
    topicName: "Windows Security",
    concept: "The SAM (Security Account Manager) database",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the SAM database store on a Windows system?",
        choices: [
          "System audit logs and event records",
          "Local user account credentials including password hashes",
          "Network interface configuration and IP addresses",
          "Installed application license keys",
        ],
        correctAnswer:
          "Local user account credentials including password hashes",
        explanation:
          "The SAM (Security Account Manager) database stores local user account information and their hashed passwords. It is located at C:\\Windows\\System32\\config\\SAM and is locked while Windows is running. Attackers target the SAM file for offline password cracking.",
      },
    ],
  },
  {
    topicName: "Windows Security",
    concept: "Group Policy Objects (GPOs) for security enforcement",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What are Group Policy Objects (GPOs) used for in a Windows domain environment?",
        choices: [
          "Routing network traffic between subnets",
          "Centrally managing and enforcing security settings, software deployment, and configurations across domain-joined computers",
          "Monitoring real-time network bandwidth usage",
          "Backing up Active Directory databases",
        ],
        correctAnswer:
          "Centrally managing and enforcing security settings, software deployment, and configurations across domain-joined computers",
        explanation:
          "GPOs allow administrators to centrally define security policies (password complexity, account lockout, audit settings, software restrictions) and apply them across users and computers in an Active Directory domain.",
      },
    ],
  },
  {
    topicName: "Windows Security",
    concept: "Windows Security Identifiers (SIDs)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is a Security Identifier (SID) in Windows?",
        choices: [
          "A human-readable username used for login",
          "A unique alphanumeric string that identifies a security principal (user, group, or computer)",
          "An encryption key used for BitLocker",
          "A certificate used for code signing",
        ],
        correctAnswer:
          "A unique alphanumeric string that identifies a security principal (user, group, or computer)",
        explanation:
          "A SID is a unique value assigned to each security principal (user, group, computer, service account) in Windows. Access control decisions use SIDs, not usernames. Well-known SIDs include S-1-5-18 (SYSTEM) and S-1-5-32-544 (Administrators group).",
      },
    ],
  },
  {
    topicName: "Windows Security",
    concept: "Credential Guard and virtual-based security",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does Windows Credential Guard protect against?",
        choices: [
          "Phishing emails that attempt to steal passwords",
          "Credential theft attacks by isolating secrets in a virtualization-based security container",
          "Brute-force attacks against the login screen",
          "SQL injection attacks against web applications",
        ],
        correctAnswer:
          "Credential theft attacks by isolating secrets in a virtualization-based security container",
        explanation:
          "Credential Guard uses virtualization-based security (VBS) to isolate NTLM hashes, Kerberos tickets, and other derived credentials in a protected container. This prevents credential theft tools like Mimikatz from extracting secrets from the LSASS process memory.",
      },
    ],
  },
  {
    topicName: "Windows Security",
    concept: "Windows audit policies and security logging",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which Windows Event Log channel contains records of logon attempts, privilege use, and security policy changes?",
        choices: [
          "Application log",
          "System log",
          "Security log",
          "Setup log",
        ],
        correctAnswer: "Security log",
        explanation:
          "The Security log records security-related events such as logon/logoff (Event IDs 4624/4634), privilege escalation (4672), account management (4720), and policy changes. These events are only generated when the corresponding audit policies are enabled.",
      },
    ],
  },
  {
    topicName: "Windows Security",
    concept: "LSASS (Local Security Authority Subsystem Service)",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is the LSASS (lsass.exe) process a high-value target for attackers on Windows?",
        choices: [
          "It manages Windows Update downloads",
          "It handles authentication and stores credentials in memory, which can be extracted by tools like Mimikatz",
          "It controls the Windows Firewall rules",
          "It manages file system encryption keys",
        ],
        correctAnswer:
          "It handles authentication and stores credentials in memory, which can be extracted by tools like Mimikatz",
        explanation:
          "LSASS enforces security policy, handles user authentication, and caches credentials (NTLM hashes, Kerberos tickets) in memory. Attackers use tools like Mimikatz to dump LSASS memory and extract these credentials for lateral movement.",
      },
    ],
  },
  {
    topicName: "Windows Security",
    concept: "AppLocker and application whitelisting",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the purpose of AppLocker in Windows?",
        choices: [
          "To manage app purchases from the Microsoft Store",
          "To control which applications, scripts, and installers are allowed to run based on rules",
          "To lock the screen after a period of inactivity",
          "To encrypt application data in transit",
        ],
        correctAnswer:
          "To control which applications, scripts, and installers are allowed to run based on rules",
        explanation:
          "AppLocker is a Windows application whitelisting feature that allows administrators to define rules controlling which executables, scripts, DLLs, and installers can run. It helps prevent unauthorized software, malware, and potentially unwanted applications from executing.",
      },
    ],
  },
  {
    topicName: "Windows Security",
    concept: "The principle of least privilege in Windows",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "How does running daily tasks with a standard user account instead of an administrator account improve Windows security?",
        choices: [
          "Standard accounts have faster boot times",
          "Standard accounts limit the damage malware can cause because they lack privileges to modify system settings or install software",
          "Standard accounts cannot access the internet, preventing malware downloads",
          "Standard accounts encrypt all files by default",
        ],
        correctAnswer:
          "Standard accounts limit the damage malware can cause because they lack privileges to modify system settings or install software",
        explanation:
          "Running as a standard user enforces least privilege: if malware executes in the user's context, it cannot install system services, modify protected registry keys, or affect other users. This significantly reduces the attack surface of a compromised account.",
      },
    ],
  },

  // =======================================================================
  // Windows Administration (12 nodes)
  // =======================================================================
  {
    topicName: "Windows Administration",
    concept: "Active Directory fundamentals",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is Active Directory (AD) in a Windows environment?",
        choices: [
          "A file sharing protocol for Windows networks",
          "A centralized directory service that manages users, computers, groups, and policies across a network domain",
          "A database for storing application data",
          "A backup and recovery tool for Windows servers",
        ],
        correctAnswer:
          "A centralized directory service that manages users, computers, groups, and policies across a network domain",
        explanation:
          "Active Directory is Microsoft's directory service that provides centralized authentication, authorization, and management for users, computers, and resources in a Windows domain. Compromising AD is often the ultimate goal of attackers targeting enterprise networks.",
      },
    ],
  },
  {
    topicName: "Windows Administration",
    concept: "Domain Controllers and their role",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the primary role of a Domain Controller (DC) in a Windows domain?",
        choices: [
          "Providing DHCP and DNS services exclusively",
          "Hosting the Active Directory database and handling authentication requests for the domain",
          "Serving as a file and print server for domain users",
          "Running antivirus scans on all domain-joined computers",
        ],
        correctAnswer:
          "Hosting the Active Directory database and handling authentication requests for the domain",
        explanation:
          "A Domain Controller stores a copy of the Active Directory database (NTDS.dit) and handles authentication (Kerberos/NTLM) for the domain. Compromising a DC gives an attacker full control over all domain accounts and resources.",
      },
    ],
  },
  {
    topicName: "Windows Administration",
    concept: "The net command for user and group management",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which Windows command lists all local user accounts on the system?",
        choices: [
          "net user",
          "net share",
          "net config",
          "net session",
        ],
        correctAnswer: "net user",
        explanation:
          "The 'net user' command lists all local user accounts. Adding a username (net user Administrator) shows account details. Attackers use net commands for domain enumeration: 'net user /domain' lists domain users, 'net group /domain' lists domain groups.",
      },
    ],
  },
  {
    topicName: "Windows Administration",
    concept: "Remote Desktop Protocol (RDP) and its security",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which default port does Remote Desktop Protocol (RDP) use, and why is it a security concern?",
        choices: [
          "Port 22; it uses weak encryption",
          "Port 3389; exposed RDP services are frequently targeted by brute-force and credential stuffing attacks",
          "Port 443; it conflicts with HTTPS traffic",
          "Port 8080; it is commonly blocked by firewalls",
        ],
        correctAnswer:
          "Port 3389; exposed RDP services are frequently targeted by brute-force and credential stuffing attacks",
        explanation:
          "RDP uses TCP port 3389 by default. Internet-exposed RDP is a top attack vector, frequently targeted by brute-force attacks, credential stuffing, and exploits like BlueKeep (CVE-2019-0708). Best practices include using VPN, Network Level Authentication (NLA), and MFA.",
      },
    ],
  },
  {
    topicName: "Windows Administration",
    concept: "Windows Update and patch management",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is timely patch management critical for Windows security?",
        choices: [
          "Patches primarily improve system performance, not security",
          "Unpatched systems remain vulnerable to known exploits that attackers actively use",
          "Patches are only needed for third-party applications, not Windows itself",
          "Patches automatically reset all user passwords for security",
        ],
        correctAnswer:
          "Unpatched systems remain vulnerable to known exploits that attackers actively use",
        explanation:
          "Microsoft releases security patches monthly (Patch Tuesday). Unpatched vulnerabilities are among the most common attack vectors. Exploit code is often published shortly after patches are released, putting unpatched systems at immediate risk.",
      },
    ],
  },
  {
    topicName: "Windows Administration",
    concept: "The Task Scheduler for automation",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Why is the Windows Task Scheduler relevant from a security perspective?",
        choices: [
          "It is only used for defragmenting disks",
          "Attackers can create scheduled tasks for persistence, running malicious payloads at system startup or on a recurring schedule",
          "It automatically patches the system without user intervention",
          "It encrypts scheduled task output for confidentiality",
        ],
        correctAnswer:
          "Attackers can create scheduled tasks for persistence, running malicious payloads at system startup or on a recurring schedule",
        explanation:
          "Windows Task Scheduler can run programs at specified times or events. Attackers frequently create scheduled tasks (schtasks.exe) for persistence, executing malware at boot or login. Reviewing scheduled tasks is essential during incident response.",
      },
    ],
  },
  {
    topicName: "Windows Administration",
    concept: "SMB (Server Message Block) file sharing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which protocol is used for Windows file sharing and is associated with major vulnerabilities like EternalBlue?",
        choices: [
          "FTP",
          "NFS",
          "SMB",
          "WebDAV",
        ],
        correctAnswer: "SMB",
        explanation:
          "SMB (Server Message Block) is the standard Windows file and printer sharing protocol (ports 445 and 139). The EternalBlue exploit (CVE-2017-0144) in SMBv1 was used by the WannaCry ransomware. SMBv1 should be disabled on all modern systems.",
      },
    ],
  },
  {
    topicName: "Windows Administration",
    concept: "PowerShell Remoting and WinRM",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What protocol does PowerShell Remoting use to enable remote command execution on Windows systems?",
        choices: [
          "SSH",
          "RDP",
          "WinRM (Windows Remote Management)",
          "Telnet",
        ],
        correctAnswer: "WinRM (Windows Remote Management)",
        explanation:
          "PowerShell Remoting uses WinRM (based on WS-Management protocol) over HTTP (port 5985) or HTTPS (port 5986) for remote administration. It enables running commands, scripts, and managing multiple systems. Attackers use it for lateral movement once they have credentials.",
      },
    ],
  },
  {
    topicName: "Windows Administration",
    concept: "The Sysinternals Suite of tools",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which Sysinternals tool provides detailed information about processes, including DLLs loaded, handles, and network connections?",
        choices: [
          "Autoruns",
          "Process Explorer",
          "TCPView",
          "BgInfo",
        ],
        correctAnswer: "Process Explorer",
        explanation:
          "Process Explorer is an advanced Task Manager replacement from the Sysinternals Suite. It shows DLL loading, handle information, process trees, and can verify digital signatures. It is invaluable for identifying malicious processes and DLL injection.",
      },
    ],
  },
  {
    topicName: "Windows Administration",
    concept: "The Autoruns tool for persistence detection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the Sysinternals Autoruns tool display?",
        choices: [
          "A list of all files modified in the last 24 hours",
          "All programs and components configured to run at system startup or user login",
          "Real-time network traffic and open connections",
          "A list of installed Windows updates",
        ],
        correctAnswer:
          "All programs and components configured to run at system startup or user login",
        explanation:
          "Autoruns shows all auto-start locations including registry Run keys, scheduled tasks, services, drivers, Winlogon entries, and browser extensions. It is one of the most effective tools for discovering malware persistence mechanisms on Windows.",
      },
    ],
  },
  {
    topicName: "Windows Administration",
    concept: "Windows Defender Firewall advanced configuration",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which tool provides the most granular control over Windows Defender Firewall rules, including inbound, outbound, and connection security rules?",
        choices: [
          "Windows Settings > Firewall",
          "Windows Defender Firewall with Advanced Security (wf.msc)",
          "Control Panel > System",
          "netsh interface show",
        ],
        correctAnswer:
          "Windows Defender Firewall with Advanced Security (wf.msc)",
        explanation:
          "Windows Defender Firewall with Advanced Security (wf.msc) provides granular control over inbound rules, outbound rules, and connection security rules (IPsec). It allows filtering by program, port, protocol, IP address, and domain profile.",
      },
    ],
  },
  {
    topicName: "Windows Administration",
    concept: "Local Security Policy and secpol.msc",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What can be configured using the Local Security Policy editor (secpol.msc) on a Windows system?",
        choices: [
          "Network adapter IP addresses and DNS settings",
          "Password policies, account lockout policies, audit policies, and user rights assignments",
          "Disk partitioning and volume management",
          "Printer sharing and queue management",
        ],
        correctAnswer:
          "Password policies, account lockout policies, audit policies, and user rights assignments",
        explanation:
          "The Local Security Policy (secpol.msc) configures security settings including password complexity requirements, account lockout thresholds, audit policies for event logging, and user rights assignments such as who can log on remotely or shut down the system.",
      },
    ],
  },

  // =======================================================================
  // Shell Scripting (12 nodes)
  // =======================================================================
  {
    topicName: "Shell Scripting",
    concept: "The shebang line (#!/bin/bash) in shell scripts",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the line '#!/bin/bash' at the top of a script file indicate?",
        choices: [
          "It is a comment that documents the script author",
          "It specifies the interpreter that should execute the script",
          "It imports the bash library functions",
          "It sets the script's file permissions to executable",
        ],
        correctAnswer:
          "It specifies the interpreter that should execute the script",
        explanation:
          "The shebang (#!) line tells the operating system which interpreter to use to execute the script. #!/bin/bash specifies the Bash shell, #!/usr/bin/python3 specifies Python 3. Without it, the script runs in the current shell, which may behave differently.",
      },
    ],
  },
  {
    topicName: "Shell Scripting",
    concept: "Variables and environment variables in Bash",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In Bash scripting, how do you access the value of an environment variable named MY_VAR?",
        choices: [
          "%MY_VAR%",
          "$MY_VAR",
          "{{MY_VAR}}",
          "@MY_VAR",
        ],
        correctAnswer: "$MY_VAR",
        explanation:
          "In Bash, variables are referenced with the $ prefix (e.g., $MY_VAR or ${MY_VAR}). The %VARIABLE% syntax is used in Windows CMD, not Bash. Environment variables like $PATH, $HOME, and $USER are important for understanding the execution environment.",
      },
    ],
  },
  {
    topicName: "Shell Scripting",
    concept: "Command piping and redirection",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In a Linux shell, what does the pipe operator (|) do?",
        choices: [
          "Redirects error output to a file",
          "Sends the standard output of one command as standard input to the next command",
          "Runs two commands in parallel",
          "Copies a file from one directory to another",
        ],
        correctAnswer:
          "Sends the standard output of one command as standard input to the next command",
        explanation:
          "The pipe operator (|) chains commands together by sending stdout of the left command as stdin of the right command. For example, 'cat /var/log/syslog | grep error' filters log lines containing 'error'. Piping is fundamental to shell scripting and log analysis.",
      },
    ],
  },
  {
    topicName: "Shell Scripting",
    concept: "The grep command for pattern matching",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the grep command do in Linux?",
        choices: [
          "Compresses files using the GZIP algorithm",
          "Searches text for lines matching a pattern or regular expression",
          "Displays the group membership of a user",
          "Graphs system performance metrics",
        ],
        correctAnswer:
          "Searches text for lines matching a pattern or regular expression",
        explanation:
          "grep (Global Regular Expression Print) searches input for lines matching a specified pattern. It is essential for log analysis and threat hunting. Common flags include -i (case insensitive), -r (recursive), -v (invert match), and -E (extended regex).",
      },
    ],
  },
  {
    topicName: "Shell Scripting",
    concept: "The awk command for text processing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is awk primarily used for in shell scripting?",
        choices: [
          "Compiling C programs",
          "Pattern scanning and processing of structured text data, especially columnar output",
          "Managing system services",
          "Encrypting files for secure storage",
        ],
        correctAnswer:
          "Pattern scanning and processing of structured text data, especially columnar output",
        explanation:
          "awk is a powerful text-processing language that excels at parsing columnar data. For example, 'awk '{print $1, $4}' access.log' extracts the first and fourth fields from a web server log. It is widely used in security for log parsing and data extraction.",
      },
    ],
  },
  {
    topicName: "Shell Scripting",
    concept: "Conditional statements (if/then/else) in Bash",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the correct syntax for an if statement in Bash?",
        choices: [
          "if (condition) { commands }",
          "if [ condition ]; then commands; fi",
          "if condition do commands end",
          "IF condition THEN commands ENDIF",
        ],
        correctAnswer: "if [ condition ]; then commands; fi",
        explanation:
          "Bash if statements use the syntax: if [ condition ]; then commands; elif [ condition ]; then commands; else commands; fi. The square brackets are actually a command (test), and spaces inside them are required. Double brackets [[ ]] provide extended test features.",
      },
    ],
  },
  {
    topicName: "Shell Scripting",
    concept: "Loops (for, while) in Bash",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "Which Bash loop iterates over a list of items such as files or IP addresses?",
        choices: [
          "foreach item in list; do commands; done",
          "for item in list; do commands; done",
          "loop item in list; execute commands; end",
          "iterate item over list { commands }",
        ],
        correctAnswer: "for item in list; do commands; done",
        explanation:
          "The Bash for loop iterates over a list: 'for ip in 192.168.1.{1..254}; do ping -c 1 $ip; done' pings every host in a subnet. For loops are commonly used in security scripts for host enumeration, log processing, and batch operations.",
      },
    ],
  },
  {
    topicName: "Shell Scripting",
    concept: "Exit codes and error handling",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In Bash, what does an exit code of 0 indicate?",
        choices: [
          "The command encountered a fatal error",
          "The command completed successfully",
          "The command was not found",
          "The command requires elevated privileges",
        ],
        correctAnswer: "The command completed successfully",
        explanation:
          "By convention, an exit code of 0 means success, and any non-zero value indicates an error. The special variable $? holds the exit code of the last command. Proper error handling in scripts (set -e, checking $?) is important for reliable automation.",
      },
    ],
  },
  {
    topicName: "Shell Scripting",
    concept: "PowerShell basics and cmdlets",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What naming convention do PowerShell cmdlets follow?",
        choices: [
          "lowercase-with-dashes (e.g., get-process)",
          "Verb-Noun (e.g., Get-Process)",
          "ALLCAPS (e.g., GETPROCESS)",
          "camelCase (e.g., getProcess)",
        ],
        correctAnswer: "Verb-Noun (e.g., Get-Process)",
        explanation:
          "PowerShell cmdlets follow a Verb-Noun naming convention (Get-Process, Set-ExecutionPolicy, Invoke-WebRequest). This consistent pattern makes commands discoverable. Get-Command and Get-Help are essential for finding and understanding available cmdlets.",
      },
    ],
  },
  {
    topicName: "Shell Scripting",
    concept: "PowerShell execution policies",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What does the PowerShell execution policy 'Restricted' prevent?",
        choices: [
          "Running individual commands in the PowerShell console",
          "Running any PowerShell scripts (.ps1 files)",
          "Importing PowerShell modules",
          "Using PowerShell Remoting",
        ],
        correctAnswer: "Running any PowerShell scripts (.ps1 files)",
        explanation:
          "The 'Restricted' execution policy (the default on Windows clients) prevents running .ps1 script files but allows individual commands. Attackers often bypass execution policies using techniques like Bypass flag, encoded commands, or piping scripts to PowerShell.",
      },
    ],
  },
  {
    topicName: "Shell Scripting",
    concept: "The sed command for stream editing",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "What is the sed command used for in Linux shell scripting?",
        choices: [
          "Securely deleting files from disk",
          "Performing search-and-replace and other text transformations on a stream of text",
          "Setting environment variables for the current session",
          "Sending email notifications from scripts",
        ],
        correctAnswer:
          "Performing search-and-replace and other text transformations on a stream of text",
        explanation:
          "sed (stream editor) performs text transformations on input streams. 'sed s/old/new/g file.txt' replaces all occurrences of 'old' with 'new'. It is commonly used in scripts to modify configuration files, sanitize log data, and process text output.",
      },
    ],
  },
  {
    topicName: "Shell Scripting",
    concept: "Command substitution in Bash",
    questionTemplates: [
      {
        type: "recognition",
        prompt:
          "In Bash, what does the syntax $(command) do?",
        choices: [
          "It defines a new function named 'command'",
          "It runs the command and substitutes its output into the surrounding command",
          "It runs the command in a subshell without capturing output",
          "It creates a variable named after the command",
        ],
        correctAnswer:
          "It runs the command and substitutes its output into the surrounding command",
        explanation:
          "Command substitution $(command) executes the enclosed command and replaces the expression with its stdout. For example, 'echo \"Today is $(date)\"' embeds the current date. The older backtick syntax `command` is equivalent but harder to nest and read.",
      },
    ],
  },
];
