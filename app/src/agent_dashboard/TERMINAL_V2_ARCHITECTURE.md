# Terminal V2 Architecture - Complete Rebuild Plan

## 🎯 Mission: Build Scalable, Maintainable Terminal UI

### Core Technology Stack

```bash
# Required Dependencies
npm install xstate @xstate/react @xstate/inspect
npm install --save-dev @xstate/test
```

## 📐 Architecture Overview

### 1. **State Management: XState**
- **Why**: Predictable state transitions, impossible states prevention, visual debugging
- **Pattern**: Actor Model with hierarchical state machines
- **Benefits**: No more 77 boolean states, clear workflows, time-travel debugging

### 2. **Design Pattern: Event-Driven Architecture**
```typescript
// Everything is an event
type TerminalEvent = 
  | { type: 'COMMAND.EXECUTE'; command: string }
  | { type: 'WORKFLOW.START'; workflow: WorkflowType }
  | { type: 'AGENT.LOADED'; data: AgentData }
  | { type: 'ERROR.OCCURRED'; error: Error }
```

### 3. **Project Structure**

```
/agent_dashboard/
├── terminal-v2/
│   ├── machines/                 # XState machines
│   │   ├── terminalMachine.ts   # Root orchestrator
│   │   ├── commandMachine.ts    # Command processor
│   │   └── workflows/            # Workflow actors
│   │       ├── dreamWorkflow.ts
│   │       ├── chatWorkflow.ts
│   │       ├── monthLearnWorkflow.ts
│   │       └── yearLearnWorkflow.ts
│   ├── services/                 # External integrations
│   │   ├── agentService.ts      # Agent data operations
│   │   ├── storageService.ts    # 0G storage
│   │   ├── contractService.ts   # Blockchain
│   │   └── aiService.ts         # AI processing
│   ├── components/               # UI Components
│   │   ├── Terminal.tsx         # Main container (<150 lines)
│   │   ├── TerminalHeader.tsx   # Header with status
│   │   ├── TerminalOutput.tsx   # Output display
│   │   ├── CommandInput.tsx     # Input handler
│   │   └── StatusIndicator.tsx  # Connection/agent status
│   ├── hooks/                    # React integration
│   │   ├── useTerminal.ts       # Main hook
│   │   └── useActor.ts          # XState actor hook
│   ├── types/                    # TypeScript definitions
│   │   ├── events.ts
│   │   ├── context.ts
│   │   └── services.ts
│   └── utils/                    # Helpers
│       ├── commandParser.ts
│       └── formatters.ts
```

## 🏗️ Core Concepts

### 1. **Terminal State Machine**

```typescript
const terminalMachine = createMachine({
  id: 'terminal',
  type: 'parallel',
  context: {
    lines: [],
    agent: null,
    activeWorkflow: null
  },
  states: {
    // Connection state
    connection: {
      initial: 'checking',
      states: {
        checking: {},
        connected: {},
        disconnected: {}
      }
    },
    // Command processing
    command: {
      initial: 'idle',
      states: {
        idle: {},
        executing: {},
        error: {}
      }
    },
    // Workflow execution
    workflow: {
      initial: 'none',
      states: {
        none: {},
        dream: {},
        chat: {},
        monthLearn: {},
        yearLearn: {}
      }
    }
  }
});
```

### 2. **Workflow as Actors**

Each workflow is an independent actor that can:
- Manage its own state
- Communicate via events
- Be spawned/stopped dynamically
- Run in parallel with others

```typescript
const dreamWorkflowMachine = createMachine({
  id: 'dreamWorkflow',
  initial: 'waitingForInput',
  context: {
    dreamText: '',
    analysis: null,
    agentData: null
  },
  states: {
    waitingForInput: {
      on: { SUBMIT: 'analyzing' }
    },
    analyzing: {
      invoke: {
        src: 'analyzeDream',
        onDone: 'confirming',
        onError: 'error'
      }
    },
    confirming: {
      on: {
        CONFIRM: 'saving',
        CANCEL: 'cancelled'
      }
    },
    saving: {
      type: 'parallel',
      states: {
        storage: {
          invoke: { src: 'saveToStorage' }
        },
        blockchain: {
          invoke: { src: 'saveToBlockchain' }
        }
      }
    }
  }
});
```

### 3. **Service Layer Pattern**

```typescript
// Services are pure, mockable functions
const services = {
  analyzeDream: async (context, event) => {
    const result = await aiService.analyze(context.dreamText);
    return result;
  },
  
  saveToStorage: async (context) => {
    const hash = await storageService.upload(context.analysis);
    return hash;
  },
  
  saveToBlockchain: async (context) => {
    const tx = await contractService.recordDream(context);
    return tx;
  }
};
```

### 4. **Component Architecture**

```typescript
// Components are thin UI layers
const Terminal: React.FC = () => {
  const [state, send] = useTerminal();
  
  return (
    <div className="terminal-container">
      <TerminalHeader status={state.value} />
      <TerminalOutput 
        lines={state.context.lines}
        activeWorkflow={state.context.activeWorkflow}
      />
      <CommandInput 
        onSubmit={(cmd) => send({ type: 'COMMAND.EXECUTE', command: cmd })}
        disabled={state.matches('workflow.executing')}
      />
    </div>
  );
};
```

## 🎨 UI/UX Principles

1. **Immediate Feedback**: Every action has instant visual response
2. **Progressive Disclosure**: Show only relevant information
3. **Graceful Degradation**: Handle errors elegantly
4. **Keyboard First**: Full keyboard navigation support
5. **Accessibility**: Screen reader support, high contrast modes

## 🧪 Testing Strategy

```typescript
// Test workflows in isolation
describe('Dream Workflow', () => {
  it('should transition through states correctly', () => {
    const machine = dreamWorkflowMachine.withConfig({
      services: mockServices
    });
    
    const { result } = renderHook(() => useInterpret(machine));
    
    act(() => {
      result.current.send({ type: 'SUBMIT', dreamText: 'test dream' });
    });
    
    expect(result.current.state.matches('analyzing')).toBe(true);
  });
});
```

## 📊 Benefits vs Current Implementation

| Current Problem | XState Solution |
|-----------------|-----------------|
| 1268 lines in one file | Max 150 lines per component |
| 77 boolean states | Single state machine with clear states |
| 25+ useEffects | Event-driven, no effect cascades |
| Unpredictable state combinations | Impossible states are impossible |
| Hard to debug | Visual debugger + time travel |
| Difficult to test | Each machine testable in isolation |
| Tight coupling | Actors communicate via events only |
| No workflow visualization | Built-in statechart visualization |

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Install XState dependencies
- [ ] Create basic terminal machine
- [ ] Implement command registry
- [ ] Build Terminal UI shell

### Phase 2: Workflows (Week 2)
- [ ] Dream workflow actor
- [ ] Chat workflow actor
- [ ] Consolidation workflows (month/year)
- [ ] Service layer implementation

### Phase 3: Integration (Week 3)
- [ ] Connect to existing hooks
- [ ] Migrate command handlers
- [ ] Implement error boundaries
- [ ] Add XState Inspector

### Phase 4: Polish (Week 4)
- [ ] Animations with Framer Motion
- [ ] Accessibility features
- [ ] Performance optimization
- [ ] Comprehensive testing

## 🔧 Development Tools

1. **XState Inspector**: Visual debugging in browser
2. **XState VSCode Extension**: Visualize machines in editor
3. **@xstate/test**: Model-based testing
4. **Storybook**: Component development in isolation

## 📝 Key Decisions

1. **No Redux/Zustand**: XState handles all state management
2. **TypeScript First**: Full type safety for events and context
3. **Actor Model**: Each workflow is independent actor
4. **Service Pattern**: All external calls through services
5. **Event Sourcing**: Can replay entire session from events

## 🎯 Success Metrics

- **Code Quality**: No file > 500 lines
- **Test Coverage**: > 80%
- **Performance**: Command response < 100ms
- **Maintainability**: New developer onboarding < 1 day
- **Scalability**: Adding new workflow < 2 hours

## 🔗 Resources

- [XState Documentation](https://xstate.js.org/docs/)
- [XState Catalog](https://xstate-catalogue.com/) - Pattern examples
- [Stately Editor](https://stately.ai/editor) - Visual machine builder
- [XState React Patterns](https://dev.to/mpocock1/how-to-manage-global-state-with-xstate-and-react-3if5)

---

**This architecture ensures:**
- ✅ Predictable state management
- ✅ Scalable workflow system
- ✅ Maintainable codebase
- ✅ Excellent developer experience
- ✅ Future-proof foundation