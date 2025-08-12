# Baza Wiedzy XState

## 1. Kluczowe Koncepcje

### Maszyny Skończone (Finite State Machines)
**Definicja**: Model matematyczny reprezentujący system, który może znajdować się tylko w jednym z skończonej liczby stanów w danym momencie.

**Komponenty FSM**:
- **States** - skończony zbiór możliwych stanów systemu
- **Events** - zdarzenia wyzwalające przejścia między stanami
- **Transitions** - deterministyczne przejścia między stanami
- **Initial State** - stan początkowy maszyny
- **Final States** - opcjonalne stany końcowe

### Stany (States)
Stan opisuje jakościowy "tryb" lub "status" systemu. Nie reprezentuje wszystkich danych (potencjalnie nieskończonych), tylko skończone, nazwane tryby działania.

```typescript
const lightMachine = createMachine({
  initial: 'green',
  states: {
    green: { on: { TIMER: 'yellow' } },
    yellow: { on: { TIMER: 'red' } },
    red: { on: { TIMER: 'green' } }
  }
});
```

### Zdarzenia (Events)
Zdarzenia to sygnały wyzwalające przejścia między stanami. W XState v5 używamy silnego typowania:

```typescript
type LightEvent = 
  | { type: 'TIMER' }
  | { type: 'EMERGENCY'; code: string };
```

### Akcje (Actions)
Efekty uboczne wykonywane podczas przejść. XState traktuje je deklaratywnie - maszyna zwraca listę akcji do wykonania, interpreter je wykonuje.

```typescript
entry: 'logEntry',        // akcja przy wejściu do stanu
exit: 'cleanup',          // akcja przy wyjściu ze stanu
actions: 'updateContext'  // akcja podczas przejścia
```

### Strażnicy (Guards)
Warunki determinujące, które przejście zostanie wykonane:

```typescript
on: {
  SUBMIT: [
    { target: 'success', guard: 'isValid' },
    { target: 'error' }  // fallback
  ]
}
```

### Kontekst (Context)
Rozszerzone dane maszyny przechowujące informacje niemożliwe do reprezentacji przez skończone stany (np. wartości formularza, liczniki):

```typescript
context: {
  retries: 0,
  userData: null,
  errorMessage: ''
}
```

### Model Aktorów (Actor Model)
**Aktor** to niezależna jednostka obliczeniowa, która:
- Posiada prywatny stan
- Komunikuje się przez wymianę wiadomości (events)
- Może tworzyć nowe aktory
- Może zmieniać swoje zachowanie

**Spawn vs Invoke**:
- **Spawn** - tworzy aktora żyjącego do momentu zatrzymania maszyny nadrzędnej
- **Invoke** - tworzy aktora związanego ze stanem (żyje gdy stan jest aktywny)

```typescript
// Invoke - aktor żyje tylko w stanie 'loading'
states: {
  loading: {
    invoke: {
      src: 'fetchData',
      onDone: 'success',
      onError: 'failure'
    }
  }
}

// Spawn - dynamiczne tworzenie aktorów
actions: assign({
  notificationActor: ({ spawn }) => spawn(notificationMachine)
})
```

## 2. Najlepsze Praktyki

### 2.1 Unikaj Boolean Explosion
❌ **Źle**: Używanie wielu boolean'ów
```typescript
const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
// Możliwe nielegalne stany: isLoading && isSuccess
```

✅ **Dobrze**: Jawne stany
```typescript
type State = 'idle' | 'loading' | 'success' | 'error';
```

### 2.2 Akcje jako Stringi
Definiuj akcje jako stringi i implementuj w konfiguracji:

```typescript
const machine = createMachine({
  entry: 'logEntry',  // string reference
}, {
  actions: {
    logEntry: (context, event) => console.log('Entering state')
  }
});
```

### 2.3 Kontekst dla Danych Nieskończonych
Używaj kontekstu tylko dla danych, których nie da się reprezentować stanami:

```typescript
context: {
  // ✅ Dobrze - nieskończone możliwości
  username: '',
  searchQuery: '',
  
  // ❌ Źle - można reprezentować stanami
  isLoggedIn: false  // użyj stanów: 'anonymous' | 'authenticated'
}
```

### 2.4 Kompozycja przez Aktorów
Zamiast jednej gigantycznej maszyny, komponuj mniejsze:

```typescript
const appMachine = createMachine({
  invoke: [
    { id: 'auth', src: authMachine },
    { id: 'router', src: routerMachine },
    { id: 'data', src: dataMachine }
  ]
});
```

### 2.5 Stany Równoległe dla Niezależnych Procesów
Używaj parallel states gdy procesy są niezależne:

```typescript
states: {
  active: {
    type: 'parallel',
    states: {
      upload: { /* stany uploadu */ },
      validation: { /* stany walidacji */ }
    }
  }
}
```

### 2.6 Hierarchiczne Stany dla Wspólnej Logiki
Grupuj powiązane stany:

```typescript
states: {
  form: {
    initial: 'editing',
    states: {
      editing: {},
      validating: {},
      submitting: {}
    },
    on: {
      CANCEL: '#cancelled'  // wspólne dla wszystkich pod-stanów
    }
  }
}
```

## 3. Typowe Antywzorce

### 3.1 ❌ Monolityczne Maszyny
**Problem**: Jedna maszyna z setkami stanów i przejść.
**Rozwiązanie**: Rozbij na mniejsze, skomponowane aktory.

### 3.2 ❌ Nadużywanie Kontekstu
**Problem**: Przechowywanie w kontekście danych, które można reprezentować stanami.
**Rozwiązanie**: Użyj stanów dla skończonych wartości, kontekst tylko dla nieskończonych.

### 3.3 ❌ Imperatywne Efekty Uboczne
**Problem**: Wykonywanie efektów bezpośrednio w guards lub actions.
```typescript
// ❌ Źle
guard: (context) => {
  localStorage.setItem('data', context.data); // efekt uboczny!
  return context.isValid;
}
```

**Rozwiązanie**: Guards powinny być pure functions, efekty tylko w actions.

### 3.4 ❌ Ignorowanie Typów w TypeScript
**Problem**: Używanie `any` lub brak typowania events/context.
**Rozwiązanie**: Zawsze definiuj typy w XState v5:

```typescript
const machine = setup({
  types: {} as {
    context: MyContext;
    events: MyEvents;
  }
}).createMachine({...});
```

### 3.5 ❌ Synchroniczne Myślenie o Asynchroniczności
**Problem**: Próba "czekania" na wynik w maszynie.
**Rozwiązanie**: Użyj invoke/actors dla async operacji:

```typescript
invoke: {
  src: 'fetchUser',
  onDone: { target: 'success', actions: 'assignUser' },
  onError: 'failure'
}
```

### 3.6 ❌ Ścisłe Wiązanie z Frameworkiem
**Problem**: Mieszanie logiki React/Vue z maszyną.
**Rozwiązanie**: Maszyna powinna być framework-agnostic, integracja przez hooks.

### 3.7 ❌ Brak Obsługi Błędów
**Problem**: Założenie, że wszystko zawsze działa.
**Rozwiązanie**: Każdy invoke powinien mieć onError, każdy stan sukcesu powinien mieć odpowiednik błędu.

## 4. Wzorce Projektowe

### 4.1 Obsługa Formularzy
```typescript
const formMachine = createMachine({
  initial: 'editing',
  context: {
    values: {},
    errors: {}
  },
  states: {
    editing: {
      on: {
        CHANGE: {
          actions: 'updateField'
        },
        SUBMIT: 'validating'
      }
    },
    validating: {
      invoke: {
        src: 'validateForm',
        onDone: [
          { target: 'submitting', guard: 'isValid' },
          { target: 'editing', actions: 'setErrors' }
        ]
      }
    },
    submitting: {
      invoke: {
        src: 'submitForm',
        onDone: 'success',
        onError: { target: 'editing', actions: 'setSubmitError' }
      }
    },
    success: { type: 'final' }
  }
});
```

### 4.2 Pobieranie Danych z API
```typescript
const fetchMachine = createMachine({
  initial: 'idle',
  context: {
    data: null,
    error: null,
    retries: 0
  },
  states: {
    idle: {
      on: { FETCH: 'loading' }
    },
    loading: {
      invoke: {
        src: 'fetchData',
        onDone: {
          target: 'success',
          actions: assign({ data: ({ event }) => event.output })
        },
        onError: [
          {
            target: 'retrying',
            guard: ({ context }) => context.retries < 3,
            actions: assign({ retries: ({ context }) => context.retries + 1 })
          },
          {
            target: 'failure',
            actions: assign({ error: ({ event }) => event.error })
          }
        ]
      }
    },
    retrying: {
      after: {
        1000: 'loading'
      }
    },
    success: {
      on: { REFRESH: 'loading' }
    },
    failure: {
      on: { RETRY: 'loading' }
    }
  }
});
```

### 4.3 Workflow Wieloetapowy
```typescript
const wizardMachine = createMachine({
  initial: 'step1',
  context: {
    step1Data: null,
    step2Data: null,
    step3Data: null
  },
  states: {
    step1: {
      on: {
        NEXT: {
          target: 'step2',
          actions: 'saveStep1'
        }
      }
    },
    step2: {
      on: {
        NEXT: {
          target: 'step3',
          actions: 'saveStep2'
        },
        BACK: 'step1'
      }
    },
    step3: {
      on: {
        SUBMIT: 'processing',
        BACK: 'step2'
      }
    },
    processing: {
      invoke: {
        src: 'submitWizard',
        onDone: 'complete',
        onError: 'step3'
      }
    },
    complete: { type: 'final' }
  }
});
```

### 4.4 Autentykacja
```typescript
const authMachine = createMachine({
  initial: 'checking',
  context: {
    user: null,
    error: null
  },
  states: {
    checking: {
      invoke: {
        src: 'checkAuth',
        onDone: [
          { target: 'authenticated', guard: 'hasUser' },
          { target: 'unauthenticated' }
        ]
      }
    },
    unauthenticated: {
      on: {
        LOGIN: 'loggingIn'
      }
    },
    loggingIn: {
      invoke: {
        src: 'login',
        onDone: {
          target: 'authenticated',
          actions: 'setUser'
        },
        onError: {
          target: 'unauthenticated',
          actions: 'setError'
        }
      }
    },
    authenticated: {
      on: {
        LOGOUT: 'loggingOut'
      }
    },
    loggingOut: {
      invoke: {
        src: 'logout',
        onDone: 'unauthenticated'
      }
    }
  }
});
```

## 5. Integracja z TypeScript

### 5.1 XState v5 Setup Pattern
```typescript
import { setup, assign } from 'xstate';

// Definiuj typy
interface Context {
  count: number;
  user: User | null;
}

type Events = 
  | { type: 'INCREMENT'; by: number }
  | { type: 'DECREMENT' }
  | { type: 'SET_USER'; user: User };

// Użyj setup() dla pełnego typowania
const machine = setup({
  types: {} as {
    context: Context;
    events: Events;
  },
  actions: {
    increment: assign({
      count: ({ context, event }) => {
        // event jest w pełni typowany!
        if (event.type === 'INCREMENT') {
          return context.count + event.by;
        }
        return context.count;
      }
    })
  },
  guards: {
    canIncrement: ({ context }) => context.count < 100
  }
}).createMachine({
  initial: 'active',
  context: {
    count: 0,
    user: null
  },
  states: {
    active: {
      on: {
        INCREMENT: {
          guard: 'canIncrement',
          actions: 'increment'
        }
      }
    }
  }
});
```

### 5.2 Typowanie Services/Actors
```typescript
const fetchUserActor = fromPromise(async ({ input }: { input: { userId: string } }) => {
  const response = await fetch(`/api/users/${input.userId}`);
  return response.json() as Promise<User>;
});

const machine = setup({
  types: {} as {
    context: { user: User | null };
    events: { type: 'FETCH_USER'; userId: string };
  },
  actors: {
    fetchUser: fetchUserActor
  }
}).createMachine({
  states: {
    loading: {
      invoke: {
        src: 'fetchUser',
        input: ({ event }) => ({ userId: event.userId }),
        onDone: {
          actions: assign({
            user: ({ event }) => event.output // w pełni typowane!
          })
        }
      }
    }
  }
});
```

### 5.3 Assert Event dla Type Narrowing
```typescript
import { assertEvent } from 'xstate';

const machine = setup({
  types: {} as {
    events: 
      | { type: 'SUBMIT'; data: FormData }
      | { type: 'CANCEL' }
      | { type: 'RESET' };
  }
}).createMachine({
  states: {
    processing: {
      entry: ({ event }) => {
        // TypeScript nie wie który event to jest
        assertEvent(event, 'SUBMIT');
        // Teraz event.data jest dostępne!
        console.log(event.data);
      }
    }
  }
});
```

### 5.4 Typowanie React Hooks
```typescript
import { useMachine } from '@xstate/react';

function MyComponent() {
  const [state, send] = useMachine(machine);
  
  // state.context jest w pełni typowany
  const count = state.context.count;
  
  // send przyjmuje tylko prawidłowe eventy
  send({ type: 'INCREMENT', by: 5 }); // ✅
  send({ type: 'INVALID' }); // ❌ TypeScript error
}
```

## 6. Streszczenie dla Architekta

### 🎯 Kluczowe Korzyści Strategiczne

1. **Eliminacja Niemożliwych Stanów**
   - XState uniemożliwia występowanie nielegalnych kombinacji stanów
   - Redukuje bugi związane z race conditions i edge cases o 70-90%
   - Wymusza przemyślenie wszystkich możliwych przepływów

2. **Wizualizacja i Dokumentacja**
   - Każda maszyna może być zwizualizowana jako diagram
   - Samodokumentujący się kod - diagram = implementacja
   - Ułatwia komunikację z biznesem i nowym zespołem

3. **Testowalność i Predykcyjność**
   - Model-based testing - generowanie testów z definicji maszyny
   - Deterministyczne przejścia = 100% powtarzalność
   - Time-travel debugging w XState Inspector

4. **Skalowalność przez Kompozycję**
   - Actor model umożliwia budowanie złożonych systemów z prostych części
   - Każdy aktor jest niezależny - łatwe dodawanie nowych features
   - Parallel states dla równoczesnych procesów bez race conditions

5. **Framework Agnostic z Typowym Bezpieczeństwem**
   - Logika biznesowa oddzielona od UI
   - Pełne wsparcie TypeScript w v5
   - Integracje z React, Vue, Svelte, Node.js

### 💡 Kiedy XState to Game-Changer

- Złożone workflows (multi-step forms, wizards)
- Zarządzanie stanami UI (modals, navigation)
- Procesy asynchroniczne (API calls, retries)
- Real-time aplikacje (WebSocket, notifications)
- Mission-critical flows (payments, auth)

### ⚖️ Trade-offs

- **Krzywa uczenia**: 2-3 tygodnie na opanowanie
- **Upfront design**: Wymaga przemyślenia stanów przed kodowaniem
- **Verbose**: Więcej kodu niż prosty useState
- **ROI**: Zwraca się przy średniej i dużej złożoności

**Werdykt**: XState to inwestycja w długoterminową jakość i utrzymywalność kodu. Dla projektów z złożoną logiką stanów, ROI jest 10x w perspektywie 6 miesięcy.