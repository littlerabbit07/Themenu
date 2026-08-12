const descriptions = {
  overview: "Astra-9 is the orchestration layer for this workspace. It monitors code, plans tasks, and keeps the project moving without losing context.",
  planner: "The planner turns vague goals into controlled milestones, dependencies, and a clear execution path with measurable output.",
  builder: "The builder compiles iterations into working interfaces, verifies the result, and narrows issues to the smallest practical fix.",
  monitor: "The monitor watches health, catches regressions, and keeps the environment stable while work continues in the background.",
  memory: "The memory module preserves context, patterns, and known trade-offs so the agent can continue from prior decisions instead of starting from scratch."
};

const agent = {
  name: 'Astra-9',
  status: 'ready',
  memory: [
    'Project context is ready.',
    'UI uses a cyber-terminal theme.',
    'Static browser delivery keeps startup fast.'
  ],
  run(command) {
    const text = command.trim();
    if (!text) {
      return;
    }

    const lower = text.toLowerCase();
    let response = 'Command acknowledged. Running a focused evaluation now.';

    if (lower.includes('summarize')) {
      response = 'This workspace is a compact front-end prototype with a terminal-inspired interface, a lightweight logic layer, and a static deployment model.';
    } else if (lower.includes('plan')) {
      response = 'Plan: 1) define the objective, 2) validate current state, 3) implement the minimal fix, 4) verify behavior in the browser.';
    } else if (lower.includes('review')) {
      response = 'Review signal: keep the interface simple, keep events deterministic, and verify interactions before broadening scope.';
    } else if (lower.includes('status')) {
      response = `Status: ${this.status}. Agent is online, responsive, and ready for the next instruction.`;
    } else if (lower.includes('help')) {
      response = 'Available actions: summarize, plan, review, status, memory, clear.';
    } else if (lower.includes('memory')) {
      response = 'Memory snapshot: ' + this.memory.join(' | ');
    } else if (lower.includes('clear')) {
      clearConsole();
      return;
    }

    appendLog(`> ${text}`, 'user');
    appendLog(response, 'agent');
    animateTyping(response, 'agent');
  }
};

const navItems = document.querySelectorAll('.nav-item');
const typewriter = document.getElementById('typewriter-text');
const title = document.getElementById('section-title');
const consoleOutput = document.getElementById('console-output');
const commandInput = document.getElementById('command-input');
const runCommandButton = document.getElementById('run-command');
const clearConsoleButton = document.getElementById('clear-console');

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach((nav) => nav.classList.remove('active'));
    item.classList.add('active');

    const section = item.dataset.section;
    title.textContent = section.charAt(0).toUpperCase() + section.slice(1);
    typewriter.textContent = '';
    typeText(descriptions[section]);
  });
});

function typeText(text, i = 0) {
  if (i < text.length) {
    typewriter.textContent += text.charAt(i);
    setTimeout(() => typeText(text, i + 1), 18);
  }
}

function appendLog(message, kind = 'system') {
  const item = document.createElement('div');
  item.className = `log-entry ${kind}`;
  item.textContent = message;
  consoleOutput.appendChild(item);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function clearConsole() {
  consoleOutput.innerHTML = '';
  appendLog('Console cleared. Agent is ready.', 'system');
}

function animateTyping(text, kind = 'agent') {
  const bubble = document.createElement('div');
  bubble.className = `log-entry ${kind} typing`;
  consoleOutput.appendChild(bubble);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;

  let cursor = 0;
  const reveal = () => {
    if (cursor <= text.length) {
      bubble.textContent = text.slice(0, cursor);
      cursor += 1;
      setTimeout(reveal, 12);
    } else {
      bubble.classList.remove('typing');
    }
  };

  reveal();
}

function handleCommandExecution() {
  const value = commandInput.value;
  if (!value.trim()) {
    return;
  }

  agent.run(value);
  commandInput.value = '';
  commandInput.focus();
}

runCommandButton.addEventListener('click', handleCommandExecution);
commandInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleCommandExecution();
  }
});

document.querySelectorAll('.quick-action').forEach((button) => {
  button.addEventListener('click', () => {
    const command = button.dataset.command;
    commandInput.value = command;
    handleCommandExecution();
  });
});

clearConsoleButton.addEventListener('click', clearConsole);

typeText(descriptions.overview);
appendLog('Session initialized. Agent online.', 'system');
appendLog('Type "help" or choose a quick action to begin.', 'system');
