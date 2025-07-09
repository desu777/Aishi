# DreamscapeAgent - Analiza Funkcji Kontraktu

##  Mint, Transfer i Podstawowe Funkcje NFT

*   **`mintAgent(proofs, descriptions, agentName, to)`**
    *   **Co robi:** Tworzy nowego Agenta NFT. Jest to jednorazowa akcja na portfel.
    *   **Parametry:** Dowody ZK (opcjonalne), opisy, unikalna nazwa agenta, adres odbiorcy.
    *   **Zwraca:** `tokenId` nowo stworzonego agenta.

*   **`transfer(to, tokenId, proofs)`**
    *   **Co robi:** Przenosi własność Agenta NFT na inny adres.
    *   **Ograniczenia:** Adres docelowy nie może już posiadać agenta.

*   **`ownerOf(tokenId)`**
    *   **Co robi:** Zwraca adres właściciela danego `tokenId`. Standardowa funkcja ERC-721.

*   **`balanceOf(owner)`**
    *   **Co robi:** Zwraca liczbę agentów posiadanych przez dany adres (zawsze 0 lub 1).

*   **`totalSupply()` / `totalAgents()`**
    *   **Co robi:** Zwraca całkowitą liczbę agentów, które zostały do tej pory stworzone.

*   **`name()`**
    *   **Co robi:** Zwraca nazwę kolekcji NFT, czyli "DreamscapeAgent".

*   **`symbol()`**
    *   **Co robi:** Zwraca symbol kolekcji, czyli "DREAM".

## Ewolucja Osobowości i Interakcje

*   **`processDailyDream(tokenId, dreamHash, impact)`**
    *   **Co robi:** Ta funkcja jest jak karmienie agenta jego snem. Agent "przetwarza" sen, co może zmienić jego charakter (osobowość) i sprawić, że stanie się mądrzejszy. Jednocześnie zapisuje w swojej codziennej pamięci "odcisk palca" (hash) tego snu, żeby o nim nie zapomnieć.
    *   **Ograniczenia:** Można wywołać raz na 24 godziny.

*   **`recordConversation(tokenId, conversationHash, contextType)`**
    *   **Co robi:** To jest jak rozmowa z agentem. Kontrakt zapisuje "odcisk palca" (hash) rozmowy w codziennej pamięci agenta i co 10 takich rozmów agent staje się trochę mądrzejszy.

*   **`getPersonalityTraits(tokenId)`**
    *   **Co robi:** Zwraca aktualne cechy osobowości agenta (kreatywność, analityczność, itp.).

*   **`getEvolutionStats(tokenId)`**
    *   **Co robi:** Zwraca statystyki ewolucji: całkowitą liczbę ewolucji, tempo ewolucji i datę ostatniej ewolucji.

*   **`hasMilestone(tokenId, name)`**
    *   **Co robi:** Sprawdza, czy agent osiągnął określony kamień milowy w rozwoju osobowości.

## Hierarchiczny System Pamięci

*   **`getAgentMemory(tokenId)`**
    *   **Co robi:** Zwraca całą strukturę pamięci agenta, zawierającą wszystkie hashe (rdzeń pamięci, miesięczne, dzienne).

*   **`consolidateMonth(tokenId, dreamMonthlyHash, convMonthlyHash, month, year)`**
    *   **Co robi:** Konsoliduje (scala) miesięczne dane. Użytkownik dostarcza hashe, a kontrakt nagradza agenta za konsolidację.

*   **`updateMemoryCore(tokenId, newHash)`**
    *   **Co robi:** Aktualizuje roczny "rdzeń pamięci" (memory core), dając duży bonus do inteligencji.

*   **`getMemoryAccess(tokenId)`**
    *   **Co robi:** Zwraca informacje o tym, jak głęboko agent ma dostęp do swojej pamięci, w zależności od poziomu inteligencji.

*   **`needsConsolidation(tokenId)`**
    *   **Co robi:** Sprawdza, czy minął miesiąc i czy agent wymaga konsolidacji danych.

*   **`getConsolidationReward(tokenId)`**
    *   **Co robi:** Pokazuje podgląd nagrody za przeprowadzenie konsolidacji w danym momencie.

## Autoryzacja i Dostęp

*   **`authorizeUsage(tokenId, user)`**
    *   **Co robi:** Pozwala właścicielowi agenta autoryzować inny adres do interakcji z agentem w jego imieniu.

*   **`authorizedUsersOf(tokenId)`**
    *   **Co robi:** Zwraca listę adresów autoryzowanych do używania danego agenta.

## Funkcje Administracyjne

*   **`pause()` / `unpause()`**
    *   **Co robi:** Wstrzymuje i wznawia działanie kluczowych funkcji kontraktu (np. minting). Tylko dla roli `PAUSER_ROLE`.
*   **`grantRole(role, account)` / `revokeRole(role, account)`**
    *   **Co robi:** Zarządza uprawnieniami (rolami) w kontrakcie. Tylko dla roli `ADMIN_ROLE`.
*   **`emergencyTransfer(tokenId, to)`**
    *   **Co robi:** Awaryjne przeniesienie agenta przez administratora.

## Publiczne Zmienne Stanu (Automatyczne Gettery)

Kontrakt udostępnia również publiczne zmienne, do których można odpytywać jak funkcje:
*   **`agents(tokenId)`**: Zwraca podstawowe dane agenta (właściciel, nazwa, daty, liczniki).
*   **`agentPersonalities(tokenId)`**: Zwraca cechy osobowości (to samo co `getPersonalityTraits`).
*   **`agentMemories(tokenId)`**: Zwraca strukturę pamięci (to samo co `getAgentMemory`).
*   **`ownerToTokenId(address)`**: Mapuje adres właściciela na `tokenId` jego agenta.
*   **`nameExists(string)`**: Sprawdza, czy dana nazwa agenta jest już zajęta.
*   **`MAX_AGENTS`**: Maksymalna podaż agentów.
*   **`MINTING_FEE`**: Koszt mintowania agenta.
