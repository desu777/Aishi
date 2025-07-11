

# **Maksymalizacja Wydajności Llama 3.3 70B Instruct: Kompleksowy Przewodnik po Zaawansowanej Inżynierii Promptów**

## **Część I: Zrozumienie Silnika \- Architektura Modelu Llama 3.3 70B Instruct**

Aby w pełni wykorzystać potencjał modelu Llama 3.3 70B Instruct, kluczowe jest fundamentalne zrozumienie jego architektury i charakterystyki. Te elementy determinują, dlaczego określone techniki promptowania są skuteczne i jak można omijać wrodzone ograniczenia modelu.

### **Podstawowe Zasady Architektoniczne i Ich Implikacje**

Architektura Llama 3 stanowi ewolucję poprzednich modeli, z kluczowymi optymalizacjami ukierunkowanymi na wydajność i efektywność.

* **Architektura Transformer typu "Decoder-Only":** Llama 3 opiera się na architekturze auto-regresywnej typu "decoder-only".1 Oznacza to, że model generuje tekst wyłącznie na podstawie poprzedzającego go kontekstu, przewidując kolejne słowo (a dokładniej token) w sekwencji. Taka konstrukcja sprawia, że jest on wyjątkowo szybki i wydajny w zadaniach generatywnych, takich jak pisanie, odpowiadanie na pytania czy tworzenie kodu. Jednocześnie implikuje to silną zależność od jakości i struktury początkowego promptu – precyzyjny i dobrze sformułowany kontekst jest absolutnie niezbędny do uzyskania pożądanych rezultatów.  
* **Grupowe Zapytanie Uwagi (Grouped Query Attention \- GQA):** W celu zwiększenia wydajności inferencji, zarówno w modelu 8B, jak i 70B, zastosowano mechanizm Grouped Query Attention (GQA).3 Jest to optymalizacja standardowego mechanizmu uwagi (Multi-Head Attention), która znacząco redukuje zapotrzebowanie na zasoby obliczeniowe i pamięć. Z perspektywy użytkownika oznacza to, że model 70B może osiągać wyższą przepustowość i niższe opóźnienia, niż byłoby to możliwe w innym przypadku, co czyni bardziej złożone, iteracyjne schematy promptowania praktycznie wykonalnymi.  
* **Długość Kontekstu:** Modele z rodziny Llama 3 standardowo obsługują długość sekwencji do 8192 tokenów.4 Choć nowsze warianty, takie jak Llama 3.1, rozszerzyły ten limit do 128 tys. tokenów 5, dla modelu Llama 3.3 70B należy przyjąć standardowe okno kontekstowe, chyba że platforma, na której jest on używany, specyfikuje inaczej. Tak duże okno kontekstowe jest kluczowym narzędziem w zaawansowanym promptowaniu, umożliwiając stosowanie rozbudowanych przykładów w technice few-shot oraz dostarczanie szczegółowego kontekstu w celu "uziemienia" odpowiedzi modelu.

### **Tokenizer 128K i Jego Wpływ na Efektywność Promptów**

Jedną z najważniejszych innowacji w Llama 3 jest nowy tokenizer o znacznie rozszerzonym słownictwie.

* **Rozszerzone Słownictwo:** Llama 3 wykorzystuje tokenizer ze słownikiem 128 000 tokenów, co stanowi znaczący wzrost w porównaniu z Llama 2\.2  
* **Poprawione Kodowanie Języka:** Większe słownictwo pozwala na znacznie bardziej efektywne kodowanie języka, zwłaszcza w przypadku języków innych niż angielski. Oznacza to, że do reprezentacji tej samej informacji potrzeba mniej tokenów. Prowadzi to do "znaczącej poprawy wydajności modelu" 3, ponieważ okno kontekstowe o długości 8K staje się w praktyce bardziej pojemne i potężne. Chociaż dane treningowe zawierają ponad 5% wysokiej jakości danych w ponad 30 językach, nadal oczekuje się, że najwyższą wydajność model będzie osiągał w języku angielskim.2

### **Korpus Pre-treningowy 15T Tokenów: Źródło Wrodzonych Zdolności**

Fundamentem możliwości Llama 3 jest bezprecedensowa skala i jakość danych, na których został wytrenowany.

* **Ogromne i Zróżnicowane Dane:** Model został wstępnie wytrenowany na ponad 15 bilionach (15×1012) tokenów pochodzących z publicznie dostępnych źródeł. Jest to zbiór siedmiokrotnie większy niż ten użyty dla Llama 2\.2  
* **Duży Udział Kodu w Danych Treningowych:** Zbiór danych zawiera czterokrotnie więcej kodu niż w przypadku Llama 2\.2 Przekłada się to bezpośrednio na wybitne wrodzone zdolności w zakresie generowania kodu, debugowania i rozumowania logicznego.3 Prompty dotyczące tych zadań mogą być bardziej bezpośrednie i zakładać wyższy bazowy poziom zrozumienia ze strony modelu.  
* **Systematyczne Filtrowanie Jakości:** Meta wykorzystała model Llama 2 do pomocy w generowaniu danych treningowych dla klasyfikatorów jakości tekstu. Zapewniło to, że 15-bilionowy zbiór danych był najwyższej możliwej jakości.3 Redukuje to skłonność modelu do generowania tekstu niskiej jakości lub bezsensownego i poprawia jego zdolności do podążania za instrukcjami.

### **Unikalne Cechy i Znane Ograniczenia Modelu 70B**

Mimo swojej potęgi, model 70B posiada specyficzne cechy i słabości, których świadomość jest kluczowa dla jego efektywnego wykorzystania.

* **Profil Wydajności:** Llama 3 70B wykazuje bardzo dobrą wydajność w zadaniach z matematyki na poziomie szkoły podstawowej, rozumowaniu arytmetycznym i podsumowywaniu. Jednakże, obserwuje się zauważalny spadek wydajności w bardziej złożonych obszarach, takich jak matematyka na poziomie gimnazjum oraz zadania wymagające rozumowania werbalnego, gdzie ustępuje modelom takim jak GPT-4.9 Tę słabość można w znacznym stopniu zniwelować za pomocą zaawansowanych technik promptowania, takich jak Chain-of-Thought (CoT).9  
* **Podatność na Kwantyzację (Krytyczna Cecha):** Badania ujawniają unikalną słabość serii modeli Llama 3 70B (w tym wersji Instruct i 3.1) w odniesieniu do kwantyzacji poprocesowej (post-training quantization, PTQ) do formatu W8A8 (8-bitowe wagi i 8-bitowe aktywacje) przy kwantyzacji per-kanałowej.10  
  * **Przyczyna:** Problem ten nie jest spowodowany wartościami odstającymi w aktywacjach, jak wcześniej sądzono, lecz "znaczącymi wartościami odstającymi w wagach" (weight outliers) we wczesnych warstwach modelu (bloki 0, 1 i 3).10 Maksymalne bezwzględne wartości wag w Llama 3 70B są o rzędy wielkości większe niż w Llama 2 70B czy Llama 3 8B.10  
  * **Konsekwencja:** Standardowa kwantyzacja per-kanałowa prowadzi do ogromnych błędów kwantyzacji i znacznej degradacji dokładności modelu.11  
  * **Rozwiązanie:** Proponowanym środkiem zaradczym jest podejście o mieszanej granularności, w którym niewielki odsetek krytycznych warstw (\<3%) wykorzystuje kwantyzację o drobniejszym ziarnie (per-grupa), podczas gdy reszta pozostaje w trybie per-kanałowym. Ta hybrydowa strategia przywraca dokładność do poziomów zbliżonych do precyzji FP16 bez potrzeby kalibracji czy dostrajania.10 Jest to kluczowa informacja dla każdego użytkownika rozważającego efektywne wdrożenie modelu lokalnie.  
* **Ograniczenia w Użyciu Narzędzi:** Użytkownicy zgłaszali problemy z Llama 3.3 70B Instruct w scenariuszach wymagających wykonania wielu narzędzi, gdzie model może poprawnie wykonać pierwsze narzędzie, ale nie jest w stanie kontynuować pracy z kolejnymi w łańcuchu.15 Sugeruje to potencjalne słabości w złożonych przepływach pracy agentów, które wymagają sekwencyjnego użycia narzędzi.

Analiza tych cech prowadzi do ważnego wniosku: ogromna skala i zaawansowany trening, które dają Llama 3 70B jego moc, wydają się również tworzyć unikalne słabości, takie jak problem z wartościami odstającymi w wagach. Nie jest to prawdopodobnie zwykły błąd, lecz artefakt dynamiki treningu na taką skalę – swoisty kompromis architektoniczny. Te wartości odstające mogą reprezentować wyspecjalizowane neurony lub obwody, kluczowe dla pewnych złożonych zadań, ale jednocześnie delikatne i bardzo wrażliwe na utratę precyzji spowodowaną kwantyzacją. Dla użytkownika oznacza to, że modelu 70B nie można traktować po prostu jako "mądrzejszej" wersji 8B. Należy być świadomym, że jego potęga wiąże się ze specyficznymi słabościami. Przy promptowaniu zadań w znanych obszarach słabości (np. wieloetapowe rozumowanie) należy od razu stosować zaawansowane frameworki, takie jak CoT. Przy wdrażaniu nie można używać standardowych technik kwantyzacji i należy zbadać wyspecjalizowane metody mieszane. Jest to kluczowa, nieoczywista wiedza pozwalająca na maksymalizację realnej wydajności i efektywności.

## **Część II: Język Llama \- Opanowanie Formatu Promptów Instruct**

Prawidłowe użycie formatu wejściowego jest absolutnie kluczowym i niepodlegającym negocjacjom warunkiem wstępnym do osiągnięcia wysokiej wydajności. Model został precyzyjnie dostrojony do interpretowania tej specyficznej składni.

### **Anatomia Promptu Llama 3 Instruct**

Modele Llama 3 Instruct są zoptymalizowane pod kątem zastosowań dialogowych i wymagają określonego formatu, aby działać poprawnie.4 Niezastosowanie tego formatu prowadzi do suboptymalnych lub nieprzewidywalnych zachowań.16

* **Struktura Obowiązkowa:** Każdy prompt musi przestrzegać schematu wykorzystującego specjalne tokeny do oddzielania ról i wiadomości.  
* **Podział Tokenów Specjalnych:** Poniższa tabela szczegółowo wyjaśnia funkcję każdego tokenu.

| Token | Nazwa | Funkcja | Zasady Umieszczania |
| :---- | :---- | :---- | :---- |
| \`\< | begin\_of\_text | \>\` | Początek tekstu |
| \`\< | start\_header\_id | \>\` | Początek nagłówka |
| \`\< | end\_header\_id | \>\` | Koniec nagłówka |
| \`\< | eot\_id | \>\` | Koniec tury |
| \`\< | end\_of\_text | \>\` | Koniec tekstu |

### **Prompt Systemowy: Projektowanie Osobowości i Ograniczeń AI**

Prompt systemowy jest głównym mechanizmem do definiowania osobowości AI, zasad, których ma przestrzegać, oraz ogólnego zadania.16 Powinien on pojawić się tylko raz, na początku konwersacji.16

* **Przykłady Praktyczne:**  
  * **Odgrywanie roli (Role-playing):** \<|start\_header\_id|\>system\<|end\_header\_id|\> Jesteś pomocnym asystentem AI udzielającym wskazówek i rekomendacji podróżniczych\<|eot\_id|\>.17  
  * **Ustawianie formatu wyjściowego:** \<|start\_header\_id|\>system\<|end\_header\_id|\> Jesteś robotem, który odpowiada tylko w formacie JSON. Odpowiadasz w formacie JSON z polem 'zip\_code'.\<|eot\_id|\>.19  
  * **Dostarczanie kontekstu:** \<|start\_header\_id|\>system\<|end\_header\_id|\> Data odcięcia wiedzy: Grudzień 2023\. Dzisiejsza data: 23 Lipiec 2024.\<|eot\_id|\>.5  
  * **Definiowanie dostępu do narzędzi:** \<|start\_header\_id|\>system\<|end\_header\_id|\> Środowisko: ipython. Narzędzia: brave\_search, wolfram\_alpha\<|eot\_id|\>.5

### **Struktura Wiadomości Użytkownika i Asystenta dla Uczenia w Kontekście**

Prawidłowe przeplatanie ról user i assistant jest kluczem do zaawansowanych technik, takich jak few-shot learning.

* **Przepływ Konwersacji:** Prompt może zawierać wiele naprzemiennych wiadomości user i assistant, ale musi zawsze kończyć się ostatnią wiadomością użytkownika, po której następuje nagłówek asystenta (\<|start\_header\_id|\>assistant\<|end\_header\_id|\>), aby zasygnalizować modelowi, że ma rozpocząć generowanie odpowiedzi.17  
* **Przykłady Few-Shot:** Tura assistant jest kluczem do dostarczania przykładów few-shot. Dostarczając pełną wymianę user \-\> assistant, demonstrujesz pożądany wzorzec wejścia-wyjścia.16  
* **Przykład Promptu Few-Shot z Wieloma Turami:**  
  \<|begin\_of\_text|\>\<|start\_header\_id|\>system\<|end\_header\_id|\>  
  Wygeneruj losowe pytanie na temat podany przez użytkownika.  
  \<|eot\_id|\>\<|start\_header\_id|\>user\<|end\_header\_id|\>  
  psy  
  \<|eot\_id|\>\<|start\_header\_id|\>assistant\<|end\_header\_id|\>  
  Pytanie: Jaka jest średnia długość życia psa?  
  \<|eot\_id|\>\<|start\_header\_id|\>user\<|end\_header\_id|\>  
  koty  
  \<|eot\_id|\>\<|start\_header\_id|\>assistant\<|end\_header\_id|\>

  Ten przykład 16 doskonale ilustruje, jak użyć bloku  
  assistant do nauczenia modelu pożądanego formatu z prefiksem "Pytanie: ".

Sztywna struktura promptu nie jest jedynie konwencją; to składnia języka specyficznego dla domeny (DSL), do interpretacji którego model został precyzyjnie dostrojony. Zauważalna zdolność modelu do precyzyjnego przestrzegania instrukcji formatowania 9 jest bezpośrednią konsekwencją tego faktu. Ta "sztywność" jest cechą, którą należy wykorzystać do uzyskania wysokiej precyzji kontroli. Zamiast traktować prompt jako prośbę w języku naturalnym, użytkownik powinien postrzegać go jako skrypt. Prompt systemowy to "blok konfiguracyjny", a tury użytkownika/asystenta to "wywołania funkcji z przykładami". Takie podejście pozwala na inżynierię wysoce niezawodnych odpowiedzi, ponieważ wykorzystuje podstawową skłonność modelu do przestrzegania tej struktury, dając bardziej solidne wyniki niż proste instrukcje.

## **Część III: Fundamentalne Strategie Promptowania**

Opierając się na wymaganej składni, ta część obejmuje podstawowe zasady projektowania skutecznych instrukcji.

### **Od Uczenia Zero-Shot do Few-Shot**

* **Zero-Shot:** Poleganie na wstępnie wytrenowanej wiedzy modelu poprzez podanie bezpośredniej instrukcji bez przykładów. Najlepsze do prostych, powszechnych zadań.19 Przykład:  
  \<|start\_header\_id|\>user\<|end\_header\_id|\>Jaka jest stolica Francji?\<|eot\_id|\>.17  
* **Few-Shot:** Dostarczenie jednego lub więcej przykładów (shots) wewnątrz promptu, aby naprowadzić model na kontekst, format lub styl. Jest to kluczowe dla złożonych lub nowatorskich zadań.19 Przykłady analizy sentymentu jasno to pokazują, dostarczając pary  
  Tekst/Sentyment, aby ustalić wzorzec.19 Badania nad Llama 3.3 również dowodzą, że jest to potężna technika dla tego modelu.22

### **Zasady Projektowania Skutecznych Instrukcji**

* **Jasność i Zwięzłość:** Bądź bezpośredni. Unikaj żargonu. Wyraźnie określ cel.19  
* **Przypisywanie Roli (Persona Prompting):** Instruowanie modelu, aby działał jako ekspert lub przyjął określoną osobowość, prowadzi do bardziej ukierunkowanych i wyższej jakości odpowiedzi. Przykłady: Jesteś ekspertem programistą... 24,  
  Jesteś wirtualnym przewodnikiem... 19,  
  Działaj jak marketer....25 Jest to jedna z najprostszych i najskuteczniejszych technik.26  
* **Definiowanie Odbiorcy:** Wyraźnie określ, dla kogo przeznaczona jest odpowiedź. Dostosowuje to złożoność i ton. Przykłady: Wyjaśnij mi to tak, jakbym miał 11 lat lub ...jakbyś tłumaczył to 5-latkowi.26  
* **Formatowanie i Struktura:** Używaj formatowania, takiego jak \#\#\#Instrukcja\#\#\# i podziały wierszy, aby wyraźnie oddzielić różne części promptu (instrukcje, przykłady, kontekst, dane wejściowe).26  
* **Bądź Autorytatywny:** Używaj języka rozkazującego. Zwroty takie jak "Twoim zadaniem jest" i "MUSISZ" są bardziej skuteczne niż uprzejme prośby ("proszę", "dziękuję"), ponieważ dają modelowi jaśniejsze poczucie priorytetu.26

## **Część IV: Zaawansowane Frameworki Rozumowania i Rozwiązywania Problemów**

To jest sedno "wykorzystania go w 110%". Przechodzimy od prostych instrukcji do ustrukturyzowanych procesów rozumowania, które zmuszają model do bardziej solidnego, przemyślanego myślenia.

### **Promptowanie typu Chain-of-Thought (CoT)**

* **Główna Koncepcja:** Rozbijanie złożonych problemów na pośrednie, sekwencyjne kroki w celu poprawy rozumowania w zadaniach arytmetycznych, zdroworozsądkowych i symbolicznych.20  
* **Zero-Shot CoT:** Najprostsza forma. Wystarczy dodać frazę "Pomyślmy krok po kroku" na końcu promptu. Ten prosty dodatek może radykalnie poprawić wyniki w problemach wymagających rozumowania.27 Blog AWS pokazuje doskonały przykład sformatowany dla Llama 3 dla problemu matematycznego, który generuje rozkład krok po kroku.17  
* **Few-Shot CoT:** Dostarczenie jednego lub więcej przykładów, które zawierają proces rozumowania krok po kroku. Jest to potężniejsze niż Zero-Shot CoT w przypadku bardzo złożonych lub nowatorskich problemów.27 Prompt zawierałby pełną wymianę użytkownik/asystent, gdzie odpowiedź asystenta zawiera szczegółowe kroki rozumowania.

### **Promptowanie typu Tree-of-Thoughts (ToT): Symulowanie Celowej Eksploracji**

* **Główna Koncepcja:** ToT przezwycięża ograniczenie liniowego myślenia CoT, pozwalając modelowi na eksplorację wielu ścieżek rozumowania (gałęzi) na każdym kroku. Generuje wiele myśli, ocenia je i podąża za najbardziej obiecującymi, tworząc "drzewo" możliwości.21 Jest to wysoce skuteczne w przypadku problemów z dużą przestrzenią poszukiwań lub gdy początkowe kroki nie są oczywiste (np. kreatywne pisanie, złożone planowanie).31  
* **Implementacja poprzez Łańcuch Promptów (Prompt Chaining):** Manualne, kierowane przez użytkownika podejście.  
  1. **Dekompozycja i Generowanie:** Poproś model o wygenerowanie wielu początkowych pomysłów. Wymień 3 potencjalne strategie na....28  
  2. **Ocena:** Poproś model o ocenę własnych pomysłów. Oceń krytycznie te strategie....28  
  3. **Rozwinięcie:** Wybierz najlepszą ścieżkę i poproś model o jej rozwinięcie. Na podstawie najskuteczniejszej strategii, przedstaw kolejne trzy kroki..28  
* **Implementacja poprzez Pojedynczy Prompt (Symulacja):** Bardziej zaawansowana technika, w której pojedynczy prompt instruuje model, aby wewnętrznie symulował proces ToT.  
  * **Symulacja Panelu Ekspertów:** Potężna struktura promptu: Wyobraź sobie, że 3 różnych ekspertów odpowiada na to pytanie... Każdy ekspert zapisuje jeden krok swojego myślenia... Krytykują nawzajem swoją pracę....30 Zmusza to model do generowania, oceny i syntezy wielu perspektyw za jednym razem.

### **Techniki Metapoznawcze i Iteracyjnego Udoskonalania**

* **Rekurencyjne Samodoskonalenie:** Ustrukturyzowana pętla, w której model jest jawnie proszony o poprawę własnego wyniku.  
  1. Wygeneruj początkową wersję \[treści\].  
  2. Oceń krytycznie własny wynik, identyfikując co najmniej 3 konkretne słabości.  
  3. Stwórz ulepszoną wersję, odnosząc się do tych słabości.  
  4. Powtórz kroki 2-3 \[N\] razy..32 Jest to doskonałe do udoskonalania złożonych dokumentów lub kodu.  
* **Dialog Wielu Osób (Multi-Persona Dialogue):** Podobne do panelu ekspertów ToT, ale skoncentrowane na eksploracji tematu z różnych filozoficznych lub ideologicznych punktów widzenia, a nie tylko na znalezieniu rozwiązania. Przyjmij perspektywę \[Fizyka\], \[Prawnika\] i \[Ekonomisty\]... Zasymuluj konstruktywny dialog między nimi....33 Jest to idealne do generowania zniuansowanej analizy złożonych zagadnień.

Postęp od CoT, przez ToT, do samodoskonalenia nie polega na wyborze "lepszej" techniki, ale na dopasowaniu obciążenia poznawczego promptu do złożoności problemu. CoT jest dla problemów *skomplikowanych* (wiele kroków, jedna ścieżka). ToT jest dla problemów *złożonych* (wiele możliwych ścieżek, niepewność). Samodoskonalenie jest dla problemów *udoskonalania* (dobry wynik istnieje, ale trzeba go zoptymalizować). Ekspert w dziedzinie promptowania nie tylko wie, czym są te techniki, ale także, *kiedy* każdą z nich zastosować. Ten strategiczny wybór jest tym, co odróżnia używanie zaawansowanych technik od używania ich po mistrzowsku.

| Technika | Główny Mechanizm | Idealny Przypadek Użycia | Przykład Struktury Promptu | Względny Koszt/Złożoność |
| :---- | :---- | :---- | :---- | :---- |
| **Chain-of-Thought (CoT)** | Liniowe, sekwencyjne rozumowanie krok po kroku. | Problemy logiczne, matematyczne, gdzie istnieje jedna poprawna ścieżka rozwiązania. | ...Pytanie... Pomyślmy krok po kroku. | Niska |
| **Tree-of-Thoughts (ToT)** | Eksploracja wielu rozgałęzionych ścieżek rozumowania, ocena i wybór. | Burza mózgów, planowanie strategiczne, kreatywne pisanie, problemy z wieloma rozwiązaniami. | Wyobraź sobie 3 ekspertów... Każdy proponuje krok... Oceniają swoje pomysły... | Średnia do Wysokiej |
| **Rekurencyjne Samodoskonalenie** | Iteracyjna pętla generowania, krytyki i poprawy własnego wyniku. | Udoskonalanie złożonego tekstu, refaktoryzacja kodu, optymalizacja istniejącego rozwiązania. | 1\. Wygeneruj wersję X. 2\. Zidentyfikuj wady. 3\. Stwórz poprawioną wersję. | Wysoka |
| **Dialog Wielu Osób** | Symulacja debaty między różnymi personami/perspektywami. | Zniuansowana analiza złożonych, wieloaspektowych zagadnień, eksploracja argumentów. | Przyjmij perspektywę X, Y, Z. Zasymuluj ich debatę na temat... | Średnia |

## **Część V: Schematy Promptowania dla Konkretnych Zastosowań**

Ta sekcja przekłada teorię na praktykę, dostarczając gotowe do skopiowania szablony dla popularnych, wartościowych zadań.

### **Generowanie Kodu o Wysokiej Wierności**

* **Generowanie Funkcji:** Użyj promptu systemowego, aby zdefiniować osobowość eksperta, a promptu użytkownika do konkretnego żądania.24  
* **Debugowanie Kodu:** Podaj wadliwy kod w prompcie użytkownika i poproś model o zidentyfikowanie błędu oraz wyjaśnienie swojego rozumowania.24  
* **Pisanie Testów Jednostkowych:** Wysoce ustrukturyzowany prompt, który określa zadanie, dokładny format wyjściowy (np. używając tagów \`\`) oraz funkcję do przetestowania.24  
* **Text-to-SQL:** Użyj promptu systemowego, aby zdefiniować osobowość eksperta (ekspert od zapytań mysql), podać schemat bazy danych i dać jawne instrukcje dotyczące formatu wyjściowego (zwróć tylko zapytanie mysql pomiędzy \<sql\>\</sql\>).34

### **Zniuansowane Pisanie Kreatywne**

* **Wymuszanie "Pokazuj, nie opowiadaj" (Show, Don't Tell):** Podaj konkretny scenariusz i jawnie poinstruuj model, aby użył techniki "Pokazuj, nie opowiadaj", opisując działania, szczegóły sensoryczne i wewnętrzne myśli, zamiast podsumowywać emocje.35  
* **Kontrolowanie Perspektywy Narracyjnej:** Wyraźnie określ pożądany punkt widzenia (np. "trzecioosobowy ograniczony") w prompcie i poinstruuj model, aby nie zmieniał perspektywy.35  
* **Zarządzanie Dialogiem:** Poinstruuj model, aby unikał przysłówków w tagach dialogowych (np. "powiedział z gniewem") i zamiast tego pokazywał emocje poprzez działanie i kontekst.35  
* **Generowanie Świeżych Metafor:** W przypadku dialogu lub prozy, jawnie poproś model, aby Unikał banałów i wyświechtanych wyrażeń. Zamiast tego, użyj świeżych metafor i porównań....35

### **Niezawodna Ekstrakcja Danych Strukturalnych**

* **Ekstrakcja do JSON:** Najbardziej niezawodna metoda łączy prompt systemowy, rolę i przykład few-shot.  
  * **Prompt Systemowy:** Jesteś robotem, który odpowiada tylko w formacie JSON.  
  * **Przykład Few-Shot:** Podaj pełną turę użytkownik/asystent, demonstrując dokładny tekst wejściowy i pożądany wynik JSON.17 Wykorzystuje to silne przestrzeganie formatu przez model.9  
  * Przykład z 17:  
    Prompt do ekstrakcji danych pracownika do obiektu JSON jest doskonałym schematem.

## **Część VI: Nawigacja i Łagodzenie Niedoskonałości Modelu**

Kluczowa sekcja dla każdego zastosowania w świecie rzeczywistym. Omawia, jak radzić sobie z błędami i uprzedzeniami modelu.

### **Strategie Redukcji Halucynacji**

* **Łagodzenie za pomocą Promptu:**  
  * **Jawna Instrukcja:** Dodaj linię do promptu systemowego, taką jak Jeśli nie znasz odpowiedzi, proszę nie podawaj fałszywych informacji lub ...po prostu powiedz, że nie wiesz.17  
  * **Wymagaj Cytatów:** W przypadku zapytań o fakty, poinstruuj model, aby Zawsze podawał źródła.19  
* **Łagodzenie oparte na Danych (Uziemienie):**  
  * **Retrieval-Augmented Generation (RAG):** Najbardziej solidna metoda. Dostarcz modelowi odpowiedni, sprawdzony kontekst wewnątrz promptu i poinstruuj go, aby odpowiedział na pytanie *tylko* na podstawie dostarczonego tekstu.17 Struktura promptu z AWS jest doskonałym przykładem:  
    Użyj następujących fragmentów pobranego kontekstu w sekcji oznaczonej przez "\`\`\`", aby odpowiedzieć na pytanie....17  
* **Dostrajanie (Fine-Tuning):** W przypadku standardowych zadań, dostrajanie na wysokiej jakości, faktycznie poprawnym zbiorze danych jest potężną, choć bardziej zaangażowaną strategią.36

### **Zarządzanie Bezpieczeństwem i Nadmiernymi Odmowami**

* **Zrozumienie Zabezpieczeń:** Model jest dostrojony do odmawiania odpowiedzi na prompty związane z nielegalnymi działaniami, mową nienawiści, zagrożeniami dla bezpieczeństwa dzieci itp..1 Deweloperzy muszą przestrzegać Polityki Dopuszczalnego Użytkowania.  
* **Problem Nadmiernych Odmów:** Znanym problemem jest to, że dostrajanie pod kątem bezpieczeństwa może prowadzić do odmawiania przez model odpowiedzi na łagodne prompty ("fałszywa odmowa"), co szkodzi doświadczeniu użytkownika.3  
* **Strategia Łagodzenia:** Jeśli łagodny prompt zostanie odrzucony, nie próbuj go "jailbreakować". Zamiast tego, przeformułuj prompt. Skup się na legalnym, nieszkodliwym celu. Rozłóż żądanie na mniejsze, wyraźnie nieszkodliwe kroki. Problemem jest często słowo kluczowe, które można uniknąć poprzez przeformułowanie.

### **Promptowanie w Celu Uzyskania Bezstronnych i Sprawiedliwych Odpowiedzi**

* **Jawna Instrukcja:** Najprostszą metodą jest dołączenie dyrektywy do promptu systemowego: Upewnij się, że Twoja odpowiedź jest bezstronna i nie opiera się na stereotypach.26  
* **Promptowanie z Wielu Perspektyw:** Użyj techniki Dialogu Wielu Osób (Sekcja 4.3), aby zmusić model do rozważenia problemu z wielu, zróżnicowanych punktów widzenia, co może ujawnić i przeciwdziałać wrodzonym uprzedzeniom.

## **Wnioski: Ramy dla Ciągłego Doskonalenia**

Osiągnięcie eksperckiego poziomu w interakcji z Llama 3.3 70B Instruct jest procesem, który wykracza poza proste zadawanie pytań. Podróż ta rozpoczyna się od dogłębnego zrozumienia jego architektury – od efektywności zapewnianej przez GQA i pojemny tokenizer, po świadomość unikalnych słabości, takich jak podatność na kwantyzację. To fundament, na którym buduje się dalsze umiejętności.

Kolejnym, niepodlegającym negocjacjom krokiem jest opanowanie rygorystycznej składni promptów. Traktowanie jej nie jako sugestii, lecz jako precyzyjnego języka programowania, otwiera drzwi do niezawodnej kontroli nad formatem i zachowaniem modelu.

Prawdziwe mistrzostwo objawia się jednak w strategicznym stosowaniu zaawansowanych frameworków rozumowania. Zamiast losowo wybierać techniki, ekspert analizuje naturę problemu: czy wymaga on liniowego, metodycznego myślenia (CoT), eksploracji wielu możliwości (ToT), czy może iteracyjnego udoskonalania istniejącego rozwiązania (Recursive Self-Improvement). Ten świadomy wybór odpowiedniego narzędzia poznawczego jest tym, co pozwala w pełni uwolnić potencjał modelu.

Ostatecznie, mistrzostwo jest procesem ciągłym, opartym na iteracyjnej pętli projektowania promptów, testowania ich, analizowania niepowodzeń i udoskonalania podejścia w oparciu o głębokie zasady przedstawione w tym raporcie.19 Tylko poprzez połączenie wiedzy technicznej, strategicznego myślenia i empirycznego doskonalenia można naprawdę wykorzystać Llama 3.3 70B w 110%.

#### **Cytowane prace**

1. meta-llama/Meta-Llama-3-8B-Instruct · Hugging Face, otwierano: lipca 11, 2025, [https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct)  
2. Llama 3: Meta's New Open-Source LLM Explained \- Ultralytics, otwierano: lipca 11, 2025, [https://www.ultralytics.com/blog/getting-to-know-metas-llama-3](https://www.ultralytics.com/blog/getting-to-know-metas-llama-3)  
3. Introducing Meta Llama 3: The most capable openly available LLM to date, otwierano: lipca 11, 2025, [https://ai.meta.com/blog/meta-llama-3/](https://ai.meta.com/blog/meta-llama-3/)  
4. The official Meta Llama 3 GitHub site, otwierano: lipca 11, 2025, [https://github.com/meta-llama/llama3](https://github.com/meta-llama/llama3)  
5. Model Cards and Prompt formats \- Llama 3.1, otwierano: lipca 11, 2025, [https://www.llama.com/docs/model-cards-and-prompt-formats/llama3\_1/](https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_1/)  
6. Llama 3 70b instruct works surprisingly well on 24gb VRAM cards : r/LocalLLaMA \- Reddit, otwierano: lipca 11, 2025, [https://www.reddit.com/r/LocalLLaMA/comments/1cj4det/llama\_3\_70b\_instruct\_works\_surprisingly\_well\_on/](https://www.reddit.com/r/LocalLLaMA/comments/1cj4det/llama_3_70b_instruct_works_surprisingly_well_on/)  
7. Fine-tune Llama 3 for text generation on Amazon SageMaker JumpStart \- AWS, otwierano: lipca 11, 2025, [https://aws.amazon.com/blogs/machine-learning/fine-tune-llama-3-for-text-generation-on-amazon-sagemaker-jumpstart/](https://aws.amazon.com/blogs/machine-learning/fine-tune-llama-3-for-text-generation-on-amazon-sagemaker-jumpstart/)  
8. meta-llama/Meta-Llama-3-70B-Instruct \- Hugging Face, otwierano: lipca 11, 2025, [https://huggingface.co/meta-llama/Meta-Llama-3-70B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3-70B-Instruct)  
9. Llama 3 70B vs GPT-4: Comparison Analysis \- Vellum AI, otwierano: lipca 11, 2025, [https://www.vellum.ai/blog/llama-3-70b-vs-gpt-4-comparison-analysis](https://www.vellum.ai/blog/llama-3-70b-vs-gpt-4-comparison-analysis)  
10. The Uniqueness of LLaMA3-70B with Per-Channel Quantization: An Empirical Study \- arXiv, otwierano: lipca 11, 2025, [https://arxiv.org/html/2408.15301v1](https://arxiv.org/html/2408.15301v1)  
11. The Uniqueness of LLaMA3-70B Series with Per-Channel Quantization \- arXiv, otwierano: lipca 11, 2025, [https://arxiv.org/html/2408.15301v2](https://arxiv.org/html/2408.15301v2)  
12. The Uniqueness of LLaMA3-70B with Per-Channel Quantization: An Empirical Study, otwierano: lipca 11, 2025, [http://www.paperreading.club/page?id=248598](http://www.paperreading.club/page?id=248598)  
13. The Uniqueness of LLaMA3-70B with Per-Channel Quantization: An Empirical Study, otwierano: lipca 11, 2025, [https://powerdrill.ai/discover/discover-The-Uniqueness-of-cm0fruehn11ry019ct3mdbtbk](https://powerdrill.ai/discover/discover-The-Uniqueness-of-cm0fruehn11ry019ct3mdbtbk)  
14. An Empirical Study of LLaMA3 Quantization: From LLMs to MLLMs \- arXiv, otwierano: lipca 11, 2025, [https://arxiv.org/html/2404.14047v2](https://arxiv.org/html/2404.14047v2)  
15. Multi MCP Tool Servers Issue with llama-3-3-70b-instruct \- Stack Overflow, otwierano: lipca 11, 2025, [https://stackoverflow.com/questions/79666130/multi-mcp-tool-servers-issue-with-llama-3-3-70b-instruct](https://stackoverflow.com/questions/79666130/multi-mcp-tool-servers-issue-with-llama-3-3-70b-instruct)  
16. Prompt Engineering with Llama 3.3 | by Tahir | Medium, otwierano: lipca 11, 2025, [https://medium.com/@tahirbalarabe2/prompt-engineering-with-llama-3-3-032daa5999f7](https://medium.com/@tahirbalarabe2/prompt-engineering-with-llama-3-3-032daa5999f7)  
17. Best prompting practices for using Meta Llama 3 with Amazon ... \- AWS, otwierano: lipca 11, 2025, [https://aws.amazon.com/blogs/machine-learning/best-prompting-practices-for-using-meta-llama-3-with-amazon-sagemaker-jumpstart/](https://aws.amazon.com/blogs/machine-learning/best-prompting-practices-for-using-meta-llama-3-with-amazon-sagemaker-jumpstart/)  
18. Model Cards and Prompt formats \- Llama 3, otwierano: lipca 11, 2025, [https://www.llama.com/docs/model-cards-and-prompt-formats/meta-llama-3/](https://www.llama.com/docs/model-cards-and-prompt-formats/meta-llama-3/)  
19. Prompting | How-to guides \- Llama, otwierano: lipca 11, 2025, [https://www.llama.com/docs/how-to-guides/prompting/](https://www.llama.com/docs/how-to-guides/prompting/)  
20. Prompt engineering techniques: Top 5 for 2025 \- K2view, otwierano: lipca 11, 2025, [https://www.k2view.com/blog/prompt-engineering-techniques/](https://www.k2view.com/blog/prompt-engineering-techniques/)  
21. Prompt Engineering: Techniques, Uses & Advanced Approaches, otwierano: lipca 11, 2025, [https://www.acorn.io/resources/learning-center/prompt-engineering/](https://www.acorn.io/resources/learning-center/prompt-engineering/)  
22. arXiv:2504.03932v1 \[cs.CL\] 4 Apr 2025, otwierano: lipca 11, 2025, [https://www.arxiv.org/pdf/2504.03932](https://www.arxiv.org/pdf/2504.03932)  
23. AI Prompt Engineering: What It Is and 15 Techniques for 2024 \- Ellogy.ai, otwierano: lipca 11, 2025, [https://ellogy.ai/ai-prompt-engineering-what-it-is-and-15-techniques-for-2024/](https://ellogy.ai/ai-prompt-engineering-what-it-is-and-15-techniques-for-2024/)  
24. Prompting Guide for Code Llama | Prompt Engineering Guide, otwierano: lipca 11, 2025, [https://www.promptingguide.ai/models/code-llama](https://www.promptingguide.ai/models/code-llama)  
25. How Tree of Thoughts Prompting Works (Explained) \- Workflows, otwierano: lipca 11, 2025, [https://www.godofprompt.ai/blog/how-tree-of-thoughts-prompting-works-explained](https://www.godofprompt.ai/blog/how-tree-of-thoughts-prompting-works-explained)  
26. 26 prompting tricks to improve LLMs \- SuperAnnotate, otwierano: lipca 11, 2025, [https://www.superannotate.com/blog/llm-prompting-tricks](https://www.superannotate.com/blog/llm-prompting-tricks)  
27. Chain-of-Thought Prompting | Prompt Engineering Guide, otwierano: lipca 11, 2025, [https://www.promptingguide.ai/techniques/cot](https://www.promptingguide.ai/techniques/cot)  
28. Beginner's Guide To Tree Of Thoughts Prompting (With Examples) | Zero To Mastery, otwierano: lipca 11, 2025, [https://zerotomastery.io/blog/tree-of-thought-prompting/](https://zerotomastery.io/blog/tree-of-thought-prompting/)  
29. What is Tree Of Thoughts Prompting? \- IBM, otwierano: lipca 11, 2025, [https://www.ibm.com/think/topics/tree-of-thoughts](https://www.ibm.com/think/topics/tree-of-thoughts)  
30. Beginner's Guide To Tree Of Thoughts Prompting (With Examples) \- DEV Community, otwierano: lipca 11, 2025, [https://dev.to/zerotomastery/beginners-guide-to-tree-of-thoughts-prompting-with-examples-4op6](https://dev.to/zerotomastery/beginners-guide-to-tree-of-thoughts-prompting-with-examples-4op6)  
31. Break Down Complex Reasoning With Tree of Thoughts Prompting \- DhiWise, otwierano: lipca 11, 2025, [https://www.dhiwise.com/post/break-down-complex-reasoning-with-tree-of-thoughts-prompting](https://www.dhiwise.com/post/break-down-complex-reasoning-with-tree-of-thoughts-prompting)  
32. Advanced Prompt Engineering Techniques for 2025: Beyond Basic Instructions \- Reddit, otwierano: lipca 11, 2025, [https://www.reddit.com/r/PromptEngineering/comments/1k7jrt7/advanced\_prompt\_engineering\_techniques\_for\_2025/](https://www.reddit.com/r/PromptEngineering/comments/1k7jrt7/advanced_prompt_engineering_techniques_for_2025/)  
33. Everyone share their favorite chain of thought prompts\! : r/LocalLLaMA \- Reddit, otwierano: lipca 11, 2025, [https://www.reddit.com/r/LocalLLaMA/comments/1hf7jd2/everyone\_share\_their\_favorite\_chain\_of\_thought/](https://www.reddit.com/r/LocalLLaMA/comments/1hf7jd2/everyone_share_their_favorite_chain_of_thought/)  
34. Best practices for prompt engineering with Meta Llama 3 for Text-to-SQL use cases \- AWS, otwierano: lipca 11, 2025, [https://aws.amazon.com/blogs/machine-learning/best-practices-for-prompt-engineering-with-meta-llama-3-for-text-to-sql-use-cases/](https://aws.amazon.com/blogs/machine-learning/best-practices-for-prompt-engineering-with-meta-llama-3-for-text-to-sql-use-cases/)  
35. Prompt Engineering for Fiction Writers – A. Omukai, otwierano: lipca 11, 2025, [https://aomukai.com/2024/01/14/prompt-engineering-for-fiction-writers/](https://aomukai.com/2024/01/14/prompt-engineering-for-fiction-writers/)  
36. 3 Recommended Strategies to Reduce LLM Hallucinations \- Vellum AI, otwierano: lipca 11, 2025, [https://www.vellum.ai/blog/how-to-reduce-llm-hallucinations](https://www.vellum.ai/blog/how-to-reduce-llm-hallucinations)  
37. \[2406.14971\] Domain Adaptation of Llama3-70B-Instruct through Continual Pre-Training and Model Merging: A Comprehensive Evaluation \- arXiv, otwierano: lipca 11, 2025, [https://arxiv.org/abs/2406.14971](https://arxiv.org/abs/2406.14971)  
38. meta-llama/Llama-3.3-70B-Instruct \- Hugging Face, otwierano: lipca 11, 2025, [https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct](https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct)