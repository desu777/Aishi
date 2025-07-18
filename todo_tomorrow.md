# TODO TOMORROW - System Konsolidacji

## ✅ **STAN OBECNY - CO DZIAŁA**

System konsolidacji jest **funkcjonalny i bezpieczny** po naszych poprawkach:
- ✅ Hash management NAPRAWIONY - transfer odpowiedzialności działa
- ✅ APPEND PATTERN działa we frontendzie  
- ✅ Kompletny flow: LLM → Storage → Contract → Cleanup
- ✅ Frontend testowany i działa poprawnie

## 🚨 **PROBLEMY DO NAPRAWY (4 items)**

### 1. **KRYTYCZNE - Empty Consolidations** 
**Problem:** Contract nie waliduje czy hashe zawierają dane
**Skutek:** Frontend blokuje konsolidację pustego miesiąca z `error: 'No data to consolidate'`
**Fix:** 
- Usuń walidację z frontendu w `useAgentConsolidation.ts:297-303`
- Pozwól na konsolidację z pustymi tablicami

### 2. **KRYTYCZNE - Yearly Reflection Access**
**Problem:** Yearly reflection dostępny TYLKO po grudniowej konsolidacji 
**Skutek:** Jeśli user przegapi grudzień, traci dostęp do yearly reflection
**Fix:** 
- Modify logic - yearly reflection po KAŻDEJ konsolidacji grudnia, nie tylko pierwszej
- Rozważ dodanie manual trigger dla yearly reflection

### 3. **ŚREDNIE - Streak Timing**
**Problem:** 37 dni może być za długo dla monthly pattern
**Skutek:** Użytkownicy mogą tracić streak niepotrzebnie  
**Fix:**
- Zmień z 37 na 31-35 dni w `_checkMonthChange()`
- Dopasuj do rzeczywistej długości miesięcy

### 4. **DROBNE - Storage Failure Recovery**
**Problem:** Brak mechanizmu rollback przy partial failures
**Skutek:** Możliwe inconsistent state przy błędach storage
**Fix:**
- Dodaj transaction-like behavior
- Rollback contract changes jeśli storage fails

## 📋 **PRIORITY ORDER**
1. **Empty Consolidations** (critical for UX)
2. **Yearly Reflection Access** (critical for features)  
3. **Streak Timing** (UX improvement)
4. **Storage Recovery** (reliability improvement)

## 🎯 **ESTIMATE**
- Total work: ~2-3 hours
- Most critical fixes: ~1 hour
- Testing: ~30 min

## 📝 **NOTES**
- Frontend testowany i działa - dobra robota!
- System jest stabilny, to tylko polish
- Konsolidacja to ostatni step przed UI work