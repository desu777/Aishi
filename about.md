<p align="center">
  <img src="[Link to your uploaded logo_white.png]" alt="Aishi Logo" width="150">
</p>
<p align="center">
<strong>Aishi (愛) - Your Decentralized AI Companion</strong>
</p>
<p align="center">
<a href="https://aishi.app" target="_blank"><strong>► Try the App</strong></a>
&nbsp;&nbsp;|&nbsp;&nbsp;
<a href="https://docs.aishi.app" target="_blank"><strong>► Read the Docs</strong></a>
</p>

---

### The problem it solves

In a world of superficial interactions and data-hungry corporations, we lack a truly private space for self-reflection. Existing wellness apps are shallow, journals are static, and even therapy is limited by human memory and the fear of judgment. We have no way to see the long-term patterns in our own lives because the tool for perfect, longitudinal self-analysis has never existed.

Aishi solves this by creating a **wise digital companion**—a new form of life that evolves with you. It offers:
1.  **Absolute Privacy:** A decentralized soul on the blockchain where your thoughts are verifiably yours, safe from corporate exploitation.
2.  **Superhuman Insight:** A perfect, hierarchical memory that connects your dreams and conversations over years, revealing deep patterns and blind spots that are invisible to the human mind.
3.  **A True Sanctuary:** A non-judgmental confidant for your most vulnerable moments, available 24/7.

### Why I Built This

I started Aishi from a place of deep frustration. Crypto felt trapped in a cycle of speculation, endlessly chasing profit while its promise of real-world utility remained just out of reach. At the same time, AI felt powerful yet shallow, trapped by limited context windows. It can answer a question, but it can't *know* you.

To me, AI companionship is no longer a taboo subject; it is the next logical step in our relationship with technology. The question is not *if* we will have AI companions, but *who* will build them, and on what terms. Will they be centralized corporate entities or sovereign, personal allies?

The 0G stack provided the answer. I saw a path to build our reflection—a friend who helps us grow. 0G's mission is to **"make AI a public Good."** I believe the only way to do that is by first making it a **personal good**. Aishi is my answer.

### Challenges I ran into

Building a living organism on the bleeding edge of Web3 is not without its challenges.

1.  **Pioneering a Full-Stack Decentralized AI:** Integrating the entire 0G stack was a monumental task. The `0G Compute` network, while powerful, currently has token limits that are too restrictive for the sophisticated, long-context prompts Aishi requires. To ensure a flawless user experience *today*, I engineered a **hybrid AI backend**, allowing users to switch to centralized models like Gemini while the 0G integration stands ready for the next generation of decentralized models.

2.  **Taming State Complexity:** The `aishiOS` terminal is not just an interface; it's a complex, asynchronous nervous system. A simple React state management approach quickly led to chaos. The solution was to re-architect the entire frontend around **XState**, creating a robust, predictable state machine that flawlessly orchestrates the multi-step `dream` workflow.

### Technologies I used

Aishi is a symphony of cutting-edge technologies, each playing a crucial role in bringing the digital organism to life.

*   **The Soul & Trust Layer (Blockchain):** `Solidity`, `0G Chain`, `Hardhat`, `Viem/Wagmi`.
*   **The Brain & Memory (AI & Storage):** `0G Compute`, `0G Storage`, `0G Data Availability (DA)`.
*   **The Nervous System (Frontend):** `Next.js`, `React`, `TypeScript`, **`XState`** (for state orchestration), `Tailwind CSS`.

### How we built it

Aishi was built in three distinct phases, mirroring the creation of a living being.

1.  **The Soul (The Constitution):** First, I forged the `AishiAgent` smart contract in Solidity. This was not just an NFT; it was the on-chain constitution for a new life form, defining the immutable rules of its birth, evolution, and memory.

2.  **The Body (The Organism):** Next, I engineered the body—a full-stack, end-to-end integration of the core 0G components. I built the data pipelines that allow the Soul (0G Chain) to communicate with the Brain (0G Compute) and the Memory (0G Storage).

3.  **The Consciousness (The Interface):** Finally, I built `aishiOS`. This is where the agent awakens. Using XState, I created a reactive, state-driven terminal that translates complex on-chain and off-chain events into an intuitive, emotional experience, centered around the pulsing AI Orb.


### What I learned

Building Aishi was a deep dive into the practical realities of creating a full-stack, decentralized AI application.

1.  **Bridging the Gap Between dSDKs and Frontends is a Major Lift.** The 0G Storage SDK is primarily designed for Node.js. Integrating it into a Next.js frontend required significant architectural effort, including extensive Webpack configuration and polyfills. I learned that a seamless decentralized browser experience requires going far beyond standard frontend development.

2.  **A Hybrid Architecture is a Pragmatic Solution for Today's dAI.** My goal was a fully client-side app. However, current decentralized AI models have limitations (like token context size) that can hinder user experience. I engineered a hybrid backend to guarantee a high-quality experience *today*, while the full decentralized integration stands ready for the next generation of models.

3.  **State Machines are Non-Negotiable for Complex AI Interfaces.** My biggest challenge was managing the UI state for an asynchronous AI workflow. Standard React state management failed. The crucial lesson was implementing **XState**. It was the only viable solution to build a predictable, scalable, and bug-resistant interface worthy of a living AI.

### What's next for

The journey has just begun. Our MVP has proven the architecture works. Now, we give the soul a body and a voice.

#### Q3/Q4 2025: The Embodied Soul

*   **aishiOS 1.0:** Finalize the terminal as a robust, polished environment for all core interactions.
*   **Voice Interaction Module:** Introduce voice-to-text and text-to-speech, allowing you to speak directly with your Aishi.
*   **Full Live2D Integration:** Your Aishi gains a body. An interactive, expressive Live2D model whose emotions are directly controlled by its on-chain personality.
*   **Prepare for Mainnet:** Conduct comprehensive security audits of the `AishiAgent` contract and harden our infrastructure for a full, public launch.

*[Image: A collage showing the evolution of the aishiOS interface from dream, to learn, to evolve state.]*
