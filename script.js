const terminalWindow = document.querySelector(".terminal-window");
const terminalOutput = document.getElementById("terminal-output");
const terminalHistory = document.getElementById("terminal-history");
const terminalForm = document.getElementById("terminal-form");
const terminalInput = document.getElementById("terminal-input");
const promptLabel = document.getElementById("prompt-label");
const pathIndicator = document.getElementById("path-indicator");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const COMMAND_NAMES = ["help", "ls", "cd", "pwd", "cat", "tree", "whoami", "clear", "open"];
const MAX_COMMAND_LENGTH = 120;
const MAX_COMMAND_HISTORY = 50;
const MAX_TERMINAL_ENTRIES = 250;

const fileSystem = {
  type: "directory",
  children: {
    about: {
      type: "directory",
      children: {
        "about.txt": {
          type: "file",
          content: [
            "Navneet Shende",
            "",
            "Cybersecurity master's student with hands-on experience in application support,",
            "technical troubleshooting, ServiceNow workflows, log analysis, APIs, databases,",
            "and incident management. I enjoy breaking down complex production issues into",
            "clear investigation steps, practical fixes, and stable long-term improvements.",
            "",
            "My approach combines security awareness, calm communication, and structured",
            "problem-solving across support operations, application behavior, and system health."
          ].join("\n")
        }
      }
    },
    skills: {
      type: "directory",
      children: {
        "skills.txt": {
          type: "file",
          content: [
            "[Cybersecurity]",
            "- Security operations fundamentals",
            "- Alert review and incident triage",
            "",
            "[Linux]",
            "- Command-line troubleshooting and system checks",
            "",
            "[SQL]",
            "- Querying data for validation and issue analysis",
            "",
            "[MongoDB]",
            "- Document inspection and support-focused investigation",
            "",
            "[ServiceNow]",
            "- Incident workflows, ticket tracking, and platform familiarity",
            "",
            "[Log Analysis]",
            "- Parsing logs, tracing errors, and correlating events",
            "",
            "[API Troubleshooting]",
            "- Endpoint testing, payload review, and response validation",
            "",
            "[Application Support]",
            "- Production issue investigation and technical debugging",
            "",
            "[Incident Management]",
            "- Prioritization, ownership, communication, and resolution tracking",
            "",
            "[Push Notification Troubleshooting]",
            "- Delivery validation, failure analysis, and support diagnostics"
          ].join("\n")
        }
      }
    },
    projects: {
      type: "directory",
      children: {
        "app-support-dashboard.txt": {
          type: "file",
          content: [
            "Project: Application Support Dashboard",
            "Description: A support-focused dashboard concept for monitoring job failures, queue backlogs, API health, and incident trends in one place.",
            "Tech Stack: HTML, CSS, JavaScript, REST API concepts, log parsing concepts",
            "Problem Solved: Support teams often jump between tools to understand whether an issue is caused by app behavior, failed jobs, or unstable integrations.",
            "Outcome: Created a unified troubleshooting view that makes triage faster and helps engineers move from symptoms to root cause with less friction."
          ].join("\n")
        },
        "servicenow-demo.txt": {
          type: "file",
          content: [
            "Project: ServiceNow Incident Automation Demo",
            "Description: A demo showing automated incident categorization, assignment, CI association, and knowledge article suggestions.",
            "Tech Stack: ServiceNow, ITSM, Flow Designer, Predictive Intelligence",
            "Problem Solved: Manual routing and inconsistent categorization slowed response times and made ticket ownership harder to track.",
            "Outcome: Demonstrated faster triage, cleaner handoffs, and more consistent incident enrichment for support teams."
          ].join("\n")
        },
        "cybersecurity-lab.txt": {
          type: "file",
          content: [
            "Project: Cybersecurity Lab Workflow",
            "Description: A hands-on lab environment for reviewing logs, validating alerts, and practicing Linux-based investigations.",
            "Tech Stack: Linux, Bash, log analysis, security operations concepts",
            "Problem Solved: Security learning can stay too theoretical without repeated investigation practice and structured note-taking.",
            "Outcome: Built a repeatable workflow for log review, evidence gathering, and concise reporting that strengthens analyst habits."
          ].join("\n")
        }
      }
    },
    experience: {
      type: "directory",
      children: {
        "experience.txt": {
          type: "file",
          content: [
            "[2026] Application Support / Technical Support",
            "- Investigated production issues affecting user workflows and core business applications",
            "- Analyzed logs to identify failures, patterns, and likely root causes",
            "- Worked with APIs, payloads, databases, incidents, and troubleshooting notes",
            "- Supported technical debugging, communication updates, and issue reporting",
            "",
            "[2025] Cybersecurity Master's Student",
            "- Built hands-on familiarity with Linux, security concepts, and structured investigation workflows",
            "- Practiced log review, alert analysis, and technical documentation",
            "- Strengthened problem-solving across support operations and defensive security thinking",
            "",
            "[2024] ServiceNow and Operations Support Practice",
            "- Explored incident workflows, escalation handling, and ticket lifecycle visibility",
            "- Focused on practical troubleshooting, ownership, and consistent follow-through"
          ].join("\n")
        }
      }
    },
    contact: {
      type: "directory",
      children: {
        "contact.txt": {
          type: "file",
          content: [
            "Email: navneet@example.com",
            "LinkedIn: https://www.linkedin.com/in/navneet-shende",
            "GitHub: https://github.com/navneet-shende",
            "Location: Dubai, UAE"
          ].join("\n")
        }
      }
    },
    resume: {
      type: "directory",
      children: {
        "resume.txt": {
          type: "file",
          content: [
            "Resume Summary",
            "- Cybersecurity master's student",
            "- Application support and technical troubleshooting background",
            "- Experience with ServiceNow, APIs, logs, SQL, MongoDB, and incident management",
            "- Use `open resume.pdf` to view or download the full PDF resume"
          ].join("\n")
        },
        "resume.pdf": {
          type: "file",
          content: "",
          openTarget: "resume.pdf"
        }
      }
    }
  }
};

let currentPath = [];
let commandHistory = [];
let historyIndex = 0;
let bootComplete = false;

function createPromptFragment(path = getPromptPath()) {
  const fragment = document.createDocumentFragment();
  const parts = [
    ["prompt-user", "navneet"],
    ["prompt-at", "@"],
    ["prompt-host", "portfolio"],
    ["prompt-colon", ":"],
    ["prompt-path", path],
    ["prompt-dollar", "$"]
  ];

  for (const [className, text] of parts) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    fragment.appendChild(span);
  }

  return fragment;
}

function getPromptPath() {
  return currentPath.length === 0 ? "~" : `~/${currentPath.join("/")}`;
}

function getAbsolutePath(pathSegments) {
  return pathSegments.length === 0 ? "/" : `/${pathSegments.join("/")}`;
}

function updateShellState() {
  promptLabel.replaceChildren(createPromptFragment());
  pathIndicator.textContent = getAbsolutePath(currentPath);
}

function scrollTerminalToBottom() {
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function trimTerminalEntries() {
  if (!terminalHistory) {
    return;
  }

  while (terminalHistory.childElementCount > MAX_TERMINAL_ENTRIES) {
    terminalHistory.removeChild(terminalHistory.firstElementChild);
  }
}

function appendCommandEntry(command) {
  if (!terminalHistory) {
    return;
  }

  const entry = document.createElement("div");
  entry.className = "terminal-entry command";

  const prompt = document.createElement("span");
  prompt.className = "prompt";
  prompt.appendChild(createPromptFragment());

  const text = document.createElement("span");
  text.textContent = command;

  entry.append(prompt, text);
  terminalHistory.appendChild(entry);
  trimTerminalEntries();
  scrollTerminalToBottom();
}

function appendTextEntry(text, kind = "output") {
  if (!terminalHistory) {
    return;
  }

  const entry = document.createElement("div");
  entry.className = `terminal-entry ${kind}`;

  const content = document.createElement("pre");
  content.className = "entry-pre";
  content.textContent = text;

  entry.appendChild(content);
  terminalHistory.appendChild(entry);
  trimTerminalEntries();
  scrollTerminalToBottom();
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalizePath(rawPath, basePath = currentPath) {
  if (!rawPath || rawPath === "~" || rawPath === "/") {
    return rawPath === "/" || rawPath === "~" ? [] : [...basePath];
  }

  const nextPath = rawPath.startsWith("/") || rawPath.startsWith("~") ? [] : [...basePath];
  const cleaned = rawPath.replace(/^~\/?/, "");
  const parts = cleaned.split("/").filter(Boolean);

  for (const part of parts) {
    if (part === ".") {
      continue;
    }

    if (part === "..") {
      if (nextPath.length > 0) {
        nextPath.pop();
      }
      continue;
    }

    nextPath.push(part);
  }

  return nextPath;
}

function getNode(pathSegments) {
  let node = fileSystem;

  for (const segment of pathSegments) {
    if (node.type !== "directory" || !node.children[segment]) {
      return null;
    }

    node = node.children[segment];
  }

  return node;
}

function findNodesByName(name, node = fileSystem, pathSegments = [], matches = []) {
  if (node.type === "directory") {
    for (const [childName, childNode] of Object.entries(node.children)) {
      const childPath = [...pathSegments, childName];

      if (childName === name) {
        matches.push({ node: childNode, pathSegments: childPath });
      }

      findNodesByName(name, childNode, childPath, matches);
    }
  }

  return matches;
}

function resolveNode(rawPath, options = {}) {
  const { basePath = currentPath, fallbackFileSearch = false } = options;
  const normalizedPath = normalizePath(rawPath, basePath);
  const directNode = getNode(normalizedPath);

  if (directNode) {
    return { node: directNode, pathSegments: normalizedPath };
  }

  if (fallbackFileSearch && rawPath && !rawPath.includes("/") && !rawPath.includes("~")) {
    const matches = findNodesByName(rawPath).filter((match) => match.node.type === "file");

    if (matches.length === 1) {
      return matches[0];
    }
  }

  return null;
}

function getOrderedEntries(node) {
  return Object.entries(node.children);
}

function formatListOutput(node) {
  if (node.type === "file") {
    return "";
  }

  return getOrderedEntries(node)
    .map(([name, childNode]) => (childNode.type === "directory" ? `${name}/` : name))
    .join("\n");
}

function buildTreeLines(node, prefix = "") {
  const lines = [];
  const entries = getOrderedEntries(node);

  entries.forEach(([name, childNode], index) => {
    const isLast = index === entries.length - 1;
    const branch = isLast ? "└── " : "├── ";
    lines.push(`${prefix}${branch}${name}`);

    if (childNode.type === "directory") {
      const childPrefix = `${prefix}${isLast ? "    " : "│   "}`;
      lines.push(...buildTreeLines(childNode, childPrefix));
    }
  });

  return lines;
}

function getTreeOutput() {
  return ["/", ...buildTreeLines(fileSystem)].join("\n");
}

function getHelpOutput() {
  return [
    "Available commands:",
    "help              Show available commands and usage tips",
    "ls [path]         List files and folders in the current directory",
    "cd <directory>    Change directory",
    "pwd               Print the current absolute path",
    "cat <file>        Display the content of a text file",
    "tree              Show the full portfolio directory structure",
    "whoami            Show a short professional identity line",
    "open resume.pdf   Open the PDF resume in a new tab",
    "clear             Clear the terminal screen",
    "",
    "Tips:",
    "- Press Tab for autocomplete",
    "- Use ArrowUp and ArrowDown for command history"
  ].join("\n");
}

function getCommonPrefix(values) {
  if (values.length === 0) {
    return "";
  }

  let prefix = values[0];

  for (let index = 1; index < values.length; index += 1) {
    while (!values[index].startsWith(prefix) && prefix) {
      prefix = prefix.slice(0, -1);
    }
  }

  return prefix;
}

function getPathSuggestions(command, partial) {
  const wantsDirectoriesOnly = command === "cd";
  const wantsFilesOnly = command === "cat" || command === "open";
  const usesHomeAlias = partial.startsWith("~");
  const cleanedPartial = partial.replace(/^~\/?/, "/");
  const isAbsolute = cleanedPartial.startsWith("/");
  const parts = cleanedPartial.split("/");
  const finalToken = parts.pop() ?? "";
  const parentParts = parts.filter(Boolean);
  const parentPath = normalizePath(
    `${isAbsolute ? "/" : ""}${parentParts.join("/")}`,
    isAbsolute ? [] : currentPath
  );
  const parentNode = getNode(parentPath);

  if (!parentNode || parentNode.type !== "directory") {
    return [];
  }

  const basePrefix = parentParts.length > 0 ? `${parentParts.join("/")}/` : "";
  const absolutePrefix = usesHomeAlias ? "~/" : "/";

  return getOrderedEntries(parentNode)
    .filter(([, childNode]) => {
      if (wantsDirectoriesOnly) {
        return childNode.type === "directory";
      }

      if (wantsFilesOnly) {
        return childNode.type === "file";
      }

      return true;
    })
    .map(([name, childNode]) => ({
      candidate: `${basePrefix}${name}${childNode.type === "directory" ? "/" : ""}`,
      name
    }))
    .filter(({ name }) => name.startsWith(finalToken))
    .map(({ candidate }) => (isAbsolute ? `${absolutePrefix}${candidate}` : candidate));
}

function autocompleteInput() {
  const rawInput = terminalInput.value;
  const hasTrailingSpace = /\s$/.test(rawInput);
  const trimmedInput = rawInput.trim();

  if (!trimmedInput) {
    appendTextEntry(COMMAND_NAMES.join("    "), "hint");
    return;
  }

  const parts = trimmedInput.split(/\s+/);

  if (parts.length === 1 && !hasTrailingSpace) {
    const matches = COMMAND_NAMES.filter((commandName) => commandName.startsWith(parts[0].toLowerCase()));

    if (matches.length === 1) {
      terminalInput.value = `${matches[0]} `;
      return;
    }

    if (matches.length > 1) {
      const sharedPrefix = getCommonPrefix(matches);

      if (sharedPrefix.length > parts[0].length) {
        terminalInput.value = sharedPrefix;
        return;
      }

      appendTextEntry(matches.join("    "), "hint");
    }

    return;
  }

  const command = parts[0].toLowerCase();

  if (!["cd", "ls", "cat", "open"].includes(command)) {
    return;
  }

  const partial = hasTrailingSpace ? "" : parts[parts.length - 1];
  const prefix = hasTrailingSpace ? `${trimmedInput} ` : rawInput.slice(0, rawInput.length - partial.length);
  const matches = getPathSuggestions(command, partial);

  if (matches.length === 1) {
    const suggestion = matches[0];
    const shouldAddSpace = !suggestion.endsWith("/");
    terminalInput.value = `${prefix}${suggestion}${shouldAddSpace ? " " : ""}`;
    return;
  }

  if (matches.length > 1) {
    const sharedPrefix = getCommonPrefix(matches);

    if (sharedPrefix.length > partial.length) {
      terminalInput.value = prefix + sharedPrefix;
      return;
    }

    appendTextEntry(matches.join("    "), "hint");
  }
}

function openResumeFile() {
  const resumeUrl = new URL("resume.pdf", window.location.href);
  const popup = window.open(resumeUrl.toString(), "_blank", "noopener,noreferrer");

  if (popup) {
    popup.opener = null;
  }

  if (!popup) {
    appendTextEntry("Popup blocked while trying to open resume.pdf. Please allow popups and try again.", "error");
  }
}

function handleLs(args) {
  const targetPath = args[0];
  const resolved = targetPath ? resolveNode(targetPath) : { node: getNode(currentPath), pathSegments: currentPath };

  if (!resolved) {
    appendTextEntry(`ls: cannot access '${targetPath}': No such file or directory`, "error");
    return;
  }

  if (resolved.node.type === "file") {
    appendTextEntry(resolved.pathSegments[resolved.pathSegments.length - 1]);
    return;
  }

  appendTextEntry(formatListOutput(resolved.node));
}

function handleCd(args) {
  const targetPath = args[0] ?? "~";
  const resolved = resolveNode(targetPath);

  if (!resolved) {
    appendTextEntry(`cd: no such file or directory: ${targetPath}`, "error");
    return;
  }

  if (resolved.node.type !== "directory") {
    appendTextEntry(`cd: not a directory: ${targetPath}`, "error");
    return;
  }

  currentPath = resolved.pathSegments;
  updateShellState();
}

function handleCat(args) {
  const targetPath = args[0];

  if (!targetPath) {
    appendTextEntry("cat: missing file operand", "error");
    return;
  }

  const resolved = resolveNode(targetPath, { fallbackFileSearch: true });

  if (!resolved) {
    appendTextEntry(`cat: ${targetPath}: No such file`, "error");
    return;
  }

  if (resolved.node.type === "directory") {
    appendTextEntry(`cat: ${targetPath}: Is a directory`, "error");
    return;
  }

  if (resolved.pathSegments[resolved.pathSegments.length - 1].endsWith(".pdf")) {
    appendTextEntry(`cat: ${targetPath}: Binary file output is not supported. Use 'open resume.pdf'.`, "error");
    return;
  }

  appendTextEntry(resolved.node.content);
}

function handleOpen(args) {
  const targetPath = args[0];

  if (!targetPath) {
    appendTextEntry("open: missing file operand", "error");
    return;
  }

  const resolved = resolveNode(targetPath, { fallbackFileSearch: true });

  if (!resolved) {
    appendTextEntry(`open: ${targetPath}: No such file`, "error");
    return;
  }

  if (resolved.node.type === "directory") {
    appendTextEntry(`open: ${targetPath}: Is a directory`, "error");
    return;
  }

  const fileName = resolved.pathSegments[resolved.pathSegments.length - 1];

  if (fileName !== "resume.pdf") {
    appendTextEntry(`open: ${targetPath}: unsupported file type`, "error");
    return;
  }

  appendTextEntry(`Opening ${getAbsolutePath(resolved.pathSegments)} ...`, "system");
  openResumeFile();
}

function handleWhoAmI() {
  appendTextEntry(
    "Navneet Shende -> Cybersecurity master's student focused on application support, ServiceNow, log analysis, APIs, databases, and incident management.",
    "system"
  );
}

function handlePwd() {
  appendTextEntry(getAbsolutePath(currentPath));
}

function handleTree() {
  appendTextEntry(getTreeOutput());
}

function handleHelp() {
  appendTextEntry(getHelpOutput(), "system");
}

function handleClear() {
  if (terminalHistory) {
    terminalHistory.replaceChildren();
  }
}

function executeCommand(rawInput) {
  const trimmedInput = rawInput.trim();

  if (!trimmedInput) {
    return;
  }

  appendCommandEntry(trimmedInput);

  const parts = trimmedInput.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Command handlers map shell-style input to fake filesystem actions and portfolio content.
  switch (command) {
    case "help":
      handleHelp();
      break;
    case "ls":
      handleLs(args);
      break;
    case "cd":
      handleCd(args);
      break;
    case "pwd":
      handlePwd();
      break;
    case "cat":
      handleCat(args);
      break;
    case "tree":
      handleTree();
      break;
    case "whoami":
      handleWhoAmI();
      break;
    case "clear":
      handleClear();
      break;
    case "open":
      handleOpen(args);
      break;
    default:
      appendTextEntry(`command not found: ${command}`, "error");
      break;
  }
}

async function bootTerminal() {
  terminalInput.disabled = true;
  updateShellState();

  const banner = `x+++++++x++++x+++++++x+++++++++++++++++++x++++++++++++++++++++++++++++++++++++++++++++++xx+xxxxxxxxxxxxxxxxxxxx
++++++++++++++++++x+++++++++++++++++++x+++++++++++++++++++++++++++++++++++++++++++++++++++xxxxxxx+xxxxxxxxxxxx
x+++x+++x+++x++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++xxxxxxxxxxxx+x+xxx
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++xxx++x+x+xx+xxxxx
x+++++++++++++++++++++++++++++++++++++++++++x$$$$$$$$$XX$X$$$XX+++++++++++++++++++++++++++++++++xx+x+x+xx+xxxxx
xx+++++++++++x+++++++x++++++++++++x+++++++X$$$$$$$$$$$$$$$$$$$$$$Xx+++++++++++++++++++++++++++x++xxxxxxxxxxxxxx
+++++++++++x++++++++++++++++x+++++++++++X$$$XX$$$$X$$$X$$$$$$$$&&$$X++++++++++++++++++++++++++++++++++++++++++x
x++++++++++++++++++++++++++++++++++++++$$$$$$$$$$&&&$$$$$$X$$$&&&&&&X+++++++++++++++++++++++++++++++++++++++++x
+++++++++++++++++++x+++x++++++++++++++X$$$$&&$&&&$$&&$&$$$$$$$$$&&&&&$x++++++++++++++++++++++++++++x+++xxxxxxxX
x+++x+++x++++++++++++++++++++++++++++X$$$$$$$$&$$$$$&$$$$$$$$$$$$$&&&&$x+++++++++++++++++++++++++++++x++xxxxxxX
+x++++x+++x+++++++++++++++x++++++++xX$X$$$&&$$$$$XXXXXX$$XX$$X$$$&&$$&&$x+++++++++++++++++++++++++++++++++++++x
x++++++++++++++++++++++++++++++++++x$$$$$$$$$xxxxxxxxx+++++++xxX$$&&&&&$x+++++++++++++++++++++++++++++++++++++x
x+++++++++++++++++++++++++++++++++++$$$$&&&Xx++++++++++++++++++xXX$$&&&&X+++++++++++++++++++++++++++++++++++++X
++x+++x+++x+++++++x++++++++x+++x++++XX$$$Xxx++++++++++++++++++xxxXX$$&&$+++++++++++++++++++++++++++++++++++++x
x+++++++++++++++++++++++++++++++++++++x$$$x+++++++++++++++++++++++xxX$$$X+++++++++++++++++++++++++++++++++++++x
++++++++++++++++++++++++++++++++++++++x$$$x++++++++++++++++++++++xxxX$$$X+++++++++++++++++++++++++++++++++++++x
x++++++++++++++++++++++++++++++++++++++x$Xx+++++++++++++++++++++++xxXX$$X+++++++++++++++++++++++++++++++++++++x
++++++++++++++++++++++++++++++++++++++++Xxx++++++++++++++++xXX$$$$$XxX$$X+++++++++++++++++++++++++++++++++++++x
x++++++++++++++++++++++++++++++++++++++++XXX$X$$$$Xx++++++xxxXXx+++xxXX$$xx++++++++++++++++++++++++++++++++++++x
x++++++++++++++++++++++++++++++++++++++++xXx+xxxxXxx+++++xxxXXX$$XXxxxXXXxX++++++++++++++++++++++++++++++++++++x
+++++++++++++++++++++++++++++++++++++++++xx+XXxXXxxxx+++xxxxxXXXXxxxxxXXxx++++++++++++++++++++++++++++++++++++x
x++++++++++++++++++++++++++++++++++++++++++x+++++++++++++xx++++++++++xxXxxx++++++++++++++++++++++++++++++++++++x
++++++++++++++++++++++++++++++++++++++++++x++++++++++++xxxx+++++++++xxXXxx++++++++++++++++++++++++++++++++++++x
x++++++++++++++++++++++++++++++++++++++++++x+++++++++++++xxxx++++++++xxXXx+++++++++++++++++++++++++++++++++++++x
x++++++++++++++++++++++++++++++++++++++++++x+++++++++++++xx+x++++++++xxX+++++++++++++++++++++++++++++++++++++++x
x+++++++++++++++++++++++++++++++++++++++++++x++++++++x++xxxx+++++++++xXx+++++++++++++++++++++++++++++++++++++++x
x++++++++++++++++++++++++++++++++++++++++++++x++++++xx+x+xxxxxxx+++xxXX++++++++++++++++++++++++++++++++++++++++x
x+++++++++++++++++++++++++++++++++++++++++++++x++++++xxxxxxxxXXx++xxxXx++++++++++++++++++++++++++++++++++++++++x
x++++++++++++++++++++++++++++++++++++++++++++++x+++xxxxxxxxxXx++++xxXX+++++++++++++++++++++++++++++++++++++++++x
x+++++++++++++++++++++++++++++++++++++++++++++++x++++xxxxxxxx++++xxX$Xxx+++++++++++++++++++++++++++++++++++++++x
x++++++++++++++++++++++++++++++++++++++++++++++X$x+++++x++++++++xXX$X$&&&$x++++++++++++++++++++++++++++++++++++x
x++++++++++++++++++++++++++++++++++++++++++++x$&$xxx++++++++++xxX$Xxx$&&$$$$+++++++++++++++++++++++++++++++++++x
x+++++++++++++++++++++++++++++++++++++++++++x$$&$x+xXxxxxxxxxXX$Xx+xx$&$X$$&X++++++++++++++++++++++++++++++++++x
x+++++++++++++++++++++++++++++++++++++++++xX$$$&$x++++xxxxxXXXxx+++xxXXX$$$&&X+++++++++++++++++++++++++++++++++x
x+++++++++++++++++++++++++++++++++++xX$$$$$$$$$&$x+++++++++++++++++xxXX$$$$$&&&$X++++++++++++++++++++++++++++++x
x+++++++++++++++++++++++++++++xX$$$$&$$$&$$$$$$&&Xx+++++++++++++++xxx$$$$$$$&$&&&&&$$$Xx+++++++++++++++++++++++x
x++++++++++++++++++++++++++X$&&&&&&&&&$&&$$$$$$&&Xx++++++++++++++xxX$$$$$$$$$&&&&&&&&&&&&&$Xx++++++++++++++++++x
x+++++++++++++++++++++++x$$$$$$$$$$$$$&$$$$$$$$$$Xxx++++++++++++xx$$$$$$$$$$&&$$$$$$$$$$$&$&$&$Xx++++++++++++++x
x++++++++++++++++++++++X$$$$$$$$$$$$$$$$$$$$$$$$$Xx++++++++++++X$$$$$$$$$$$&$$$$$$$$$$$$$$$$$$$$$X+++++++++++++x
+++++++++++++++++++++x$$$$$$$&$&$$$$&$$$$$$$$$$$XXxx+++++++X$$&&$$$$$$$$$&&$$$$$$$$$$$$$&$$&&&&$&x++++++++++++x
x+++++++++++++++++++++$$$$$$$$$&&$$$$&$$$$$$$$$$$$$XXx+++++X$&$$$$$&$$$$$&$$$$$$$$$$$$$$$&$$&&&&$&&x+++++++++++x
++++++++++++++++++++x$$$$$$$$$$$$$$$$$$$$$$$$&&$$$$$XXx++x$$$$$$$$$$$&$&$$$$$$$$$$$$$$$$$$$$$$$$$$$+++++++++++x
++++++++++++++++++++X$$$$$$$$$&$$$$$$$$$$$$&$&&$$$$$$$XxxX$$$$$$$&$$$&$&$$$$$$$$$$$$$$$$$$$$$$$$$$$x++++++++++x
x+++++++++++++++++++X$$$$$$$$$&&&$$$&&$$$$&&$$&&&$$$$&&&$X$$$$&$$$&$&&&$&&$&$$$$&$$$$$$$&&$&&&$&$&&&X++++++++++x
++++++++++++++++++x$$$$$$$$$$&&$$$$$$$$$$$$$$$$&$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$&$++++++++++x
x++++++++++++++++++X$$$$$$$$$$$$$$$$$$$$$$$$$$$$&&$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$X+++++++++x
+++++++++++++++++x$$$$$$$$$$$&&$$$$$$$$$$$&$$$$&&&$$$XX$$$$$$$$&$&$$$&&$$$$$$$$$$$$$$$$$$$$$$$$$&&&&$+++++++++x
x+++++++++++++++++$$$$$$$$$$$$&&$$$$$$$$$$$$$$$$$&&$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$&$$$$$$$$&$&x++++++++x
++++++++++++++++x$$$$$$$$$$$X$$$$$$$$$$$$$$$$$$$$&&$$&$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$x++++++++x
++++++++++++++++X$$$$$$$$$$&$$&&$$$$$$$$$$$$$$$$$&&$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$&$$$$$$$$&X++++++++x
x+++++++++++++++x$$$$$$&$$$$$$$$&&$$$$$$$$$$$$$$$$$&&&$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$&$$$$$$$$$$$&$++++++++x
+++++++++++++++$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$&$$$$$$$$$$$$$++++++++x
x++++++++++++++x$$$$$$$$&$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$&$$$$$$$$$$$$$++++++++x
+++++++++++++++X$$$$$$$$$&$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$Xxx$$$$$$$&$$$$$$$$$$$$$$++++++++x
x+++++++++++++xX$$$$$$$$$$&$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$XxxX$$$$$$$$$$$$$$$$$$$$$x+++++++x
+++++++++++++++x$$$$$$$$$$$&&&$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$Xx$$$$$$$&$$$$$$$$$$$$$$$x+++++++x
x+++++++++++++$$$$$$$$$$$$$&&&$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$&$$$$$$$$$$$$$$$x+++++++x
x+++++++++++++$$$$$$$$$$$$$$$&$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$&$$$$$$$$$$$$$&&X+++++++x
x+++++++++++++$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$&$&$$$$$$$$$$$$&X+++++++x`;

  const welcomeLines = [
    { text: "welcome", type: "command" },
    { text: banner, type: "banner" },
    { text: "Welcome to Navneet's terminal portfolio. Version 2.0.0", type: "system" },
    { text: "---", type: "muted" },
    { text: "This portfolio works like a real terminal. Explore it with filesystem-style commands.", type: "system" },
    { text: "Type `help` to view every command, `tree` to inspect the structure, and `open resume.pdf` to launch the resume.", type: "system" },
    { text: "Focused on cybersecurity, application support, technical troubleshooting, ServiceNow, APIs, databases, and incident management.", type: "system" }
  ];

  for (const line of welcomeLines) {
    if (line.type === "command") {
      appendCommandEntry(line.text);
    } else {
      appendTextEntry(line.text, line.type);
    }

    if (!prefersReducedMotion) {
      await wait(170);
    }
  }

  terminalInput.disabled = false;
  bootComplete = true;
  terminalInput.focus();
}

function handleSubmit(event) {
  event.preventDefault();

  if (!bootComplete) {
    return;
  }

  const command = terminalInput.value;

  if (!command.trim()) {
    return;
  }

  if (command.length > MAX_COMMAND_LENGTH) {
    appendTextEntry(`input rejected: commands must be ${MAX_COMMAND_LENGTH} characters or fewer`, "error");
    return;
  }

  commandHistory.push(command);

  if (commandHistory.length > MAX_COMMAND_HISTORY) {
    commandHistory.shift();
  }

  historyIndex = commandHistory.length;
  executeCommand(command);
  terminalInput.value = "";
}

function handleHistoryNavigation(event) {
  if (!bootComplete || commandHistory.length === 0) {
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();

    if (historyIndex > 0) {
      historyIndex -= 1;
    } else {
      historyIndex = 0;
    }

    terminalInput.value = commandHistory[historyIndex];
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();

    if (historyIndex < commandHistory.length - 1) {
      historyIndex += 1;
      terminalInput.value = commandHistory[historyIndex];
      return;
    }

    historyIndex = commandHistory.length;
    terminalInput.value = "";
  }
}

function handleKeydown(event) {
  if (event.key === "Tab") {
    event.preventDefault();

    if (bootComplete) {
      autocompleteInput();
    }

    return;
  }

  handleHistoryNavigation(event);
}

terminalForm.addEventListener("submit", handleSubmit);
terminalInput.addEventListener("keydown", handleKeydown);

terminalWindow.addEventListener("mousedown", (event) => {
  if (event.target instanceof HTMLInputElement) {
    return;
  }

  window.setTimeout(() => {
    terminalInput.focus();
  }, 0);
});

updateShellState();
bootTerminal();
