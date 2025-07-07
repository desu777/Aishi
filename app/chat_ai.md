# Dreamscape Agent Chat Architecture

This document outlines the architecture of the Dreamscape Agent Chat, which is designed for a seamless and responsive user experience while maintaining long-term memory on the blockchain.

## 🚀 Core Concept: Hybrid Conversation Model

The system utilizes a hybrid approach to manage conversation context, combining a fast, local in-memory session with the agent's long-term, on-chain history.

- **Local Session (In-Memory)**: Provides immediate, stateful context for an ongoing conversation, ensuring rapid back-and-forth interaction without unnecessary network requests.
- **Blockchain History (0G Storage)**: Serves as the agent's long-term memory, storing personality traits, past dreams, and historical conversations.

## 🔄 Conversation Flow

The conversation flow is intelligently managed based on the session state:

1.  **First Message of a Session**:
    - The system builds a comprehensive initial context by fetching the agent's core **personality**, recent **dream history**, and past **conversation history** from the blockchain (0G Storage).
    - This ensures the agent is aware of its identity and long-term memory from the start.

2.  **Subsequent Messages in the Session**:
    - For all subsequent messages within the same session, the system uses the **local conversation history**.
    - It appends the current session's back-and-forth messages to the agent's personality context, creating a prompt that reflects the immediate conversational flow.
    - This avoids costly and slow lookups to 0G Storage for every message, resulting in a much faster and more fluid user experience.

3.  **Saving a Conversation (Optional)**:
    - The user can choose to save the current conversation session to the blockchain.
    - This action bundles the entire local session, saves it to 0G Storage, and records the resulting hash on-chain, effectively adding it to the agent's long-term memory.

## ✨ Key Advantages

-   **Performance**: Drastically reduces latency for ongoing conversations by minimizing calls to external storage.
-   **Efficiency**: Reduces the number of read operations from the 0G Storage network, which can lead to cost savings.
-   **Natural Interaction**: Creates a more natural and stateful conversation experience for the user.
-   **Persistence**: Retains the option for long-term memory and personality evolution through on-chain records.

## 🔧 Hook and Function Summary

-   `useAgentChat()`: The main hook orchestrating the entire process.
-   `buildChatContext()`: Service function that intelligently constructs the AI prompt based on whether it's the first message or a subsequent one in a session.
-   `sendMessage()`: Handles sending a message, triggering context creation and AI response.
-   `clearSessionHistory()`: Allows the user to start a new, fresh conversation session, which will once again pull from the long-term blockchain history.
-   `saveCurrentConversation()`: Persists the current session's chat history to the blockchain.
