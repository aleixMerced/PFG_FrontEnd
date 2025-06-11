% Exerici 1:
% nombre_desubicats(+L,?Des)
% El nombre d’elemens que no es troben a la posicio correcta de la llista L es Des

% Li pases la posició per on ha de començar a buscar
nombre_desubicats(L, Des) :-
    nombre_desubicats(L, 0, Des).

% Cas base: llista buida
nombre_desubicats([], _Pos, 0).

% Cas on l'element no està a la posició correcta
nombre_desubicats([H|T], Pos, Des) :-
    H =\= Pos,
    !,
    Seg is Pos + 1,
    nombre_desubicats(T, Seg, DesRes),
    Des is DesRes + 1.

% Cas on l'element està ben posat
nombre_desubicats([H|T], Pos, Des) :-
    H =:= Pos,
    Seg is Pos + 1,
    nombre_desubicats(T, Seg, Des).


% Exercici 2:
% suma_desplacaments(+L,Sum)
% Sum es la suma de diferencies (en valor absolut) entre la posicio que ocupa un nombre a L
%   i la posicio que hauria d’ocupar.

suma_desplacaments(L, Sum) :- suma_desplacaments_aux(L, 0, Sum).

% Mètode per calcular la suma de diferències entre posició
% Cas base: la llista és buida, el desplaçament serà 0
suma_desplacaments_aux([], _Index, 0).
% Cas on la llista té elements, suma la posció real amb la correcta
suma_desplacaments_aux([H|T], Index, Sum) :-
    abs(H - Index, Diferencia),
    IndexSeguent is Index + 1,
    suma_desplacaments_aux(T, IndexSeguent, SumaRestant),
    Sum is Diferencia + SumaRestant.


% Exercici 3:
% a_inserir(+L,?L2,?Pas)
% L2 es el resultat d’aplicar l’accio inserir a L, i Pas conte la tupla pas
%   inserir(Prefix1,Prefix2, Fragment,Sufix)

a_inserir(L, L2, pas_inserir(Prefix1, Prefix2, Fragment, Sufix)) :-
    append(Prefix, Resta, L),
    append(Fragment, Sufix, Resta),
    Fragment \== [],
    append(Prefix1, Prefix2, Prefix),
    Prefix2 \== [],
    ordenat(Prefix),
    ordenat(Fragment),
    condicions_insercio1(Prefix1, Fragment),
    condicions_insercio2(Fragment,Prefix2),
    append(Prefix1, Fragment, NouPrefix1),
    append(NouPrefix1, Prefix2, NouPrefix),
    append(NouPrefix, Sufix, L2).

%diu si esta ordenada
ordenat([]).
ordenat([_]).
ordenat([X, Y|T]) :-
    X =< Y,
    ordenat([Y|T]).

%Prefix1 és buit i per tant no mira res
condicions_insercio1([], _Fragment).

%Compara l'ultim de prefix1 amb el primer de fragment
condicions_insercio1(Prefix1, Fragment) :-
    Prefix1 \== [],
    ultim(Prefix1, UltimP),
    Fragment = [PrimerF|_],
    UltimP < PrimerF.

%Compara l'ultim element del fragment amb el primer del prefix2
condicions_insercio2(Fragment, Prefix2) :-
    ultim(Fragment, UltimF),
    Prefix2 = [PrimerP|_],
    UltimF < PrimerP.


% Últim element d'una llista
ultim([X], X).
ultim([_|T], X) :-
    ultim(T, X).


% Exercici 4:
% a_capgirar(+L,?L2,Pas)
% L2 es el resultat d’aplicar alguna de les subaccions de capgirar a L, i Pas
%   conte la tupla pas capgirar(Prefix,Fragment,Sufix)

a_capgirar(L, L2, Pas) :-
    append(Prefix, Rest, L),
    append(Fragment, Sufix, Rest),
    length(Fragment, Len),
    Len >= 2,
    condicional(L, Prefix, Fragment, Sufix),
    capgirar(Fragment, FragmentGirat),
    append(Prefix, FragmentGirat, Temp),
    append(Temp, Sufix, L2),
    Pas = pas_capgirar(Prefix, Fragment, Sufix).

% Capgirar creixent esquerra
condicional(_L, Prefix, Fragment, _Sufix) :-
    es_creixent(Fragment),
    Prefix \= [],
    ultim_element(Prefix, LastP),
    ultim_element(Fragment, LastF),
    LastP > LastF.

% Capgirar creixent dreta
condicional(_L, _Prefix, Fragment, Sufix) :-
    es_creixent(Fragment),
    Sufix \= [],
    primer_element(Fragment, FirstF),
    primer_element(Sufix, FirstS),
    FirstS < FirstF.

% Capgirar decreix esquerra
condicional(_L, Prefix, Fragment, _Sufix) :-
    es_decreixent(Fragment),
    Prefix \= [],
    ultim_element(Prefix, LastP),
    ultim_element(Fragment, LastF),
    LastP < LastF.

% Capgirar decreix dreta
condicional(_L, _Prefix, Fragment, Sufix) :-
    es_decreixent(Fragment),
    Sufix \= [],
    primer_element(Fragment, FirstF),
    primer_element(Sufix, FirstS),
    FirstS > FirstF.

% Capgirar tot
condicional(L, Prefix, Fragment, Sufix) :-
    es_decreixent(L),
    Prefix = [],
    Sufix = [],
    Fragment = L.

% Obtenir l'últim element
ultim_element([X], X).
ultim_element([_ | T], X) :-
    ultim_element(T, X).

% Obtenir el primer element
primer_element([X | _], X).

% La llista està en ordre creixent
es_creixent([_]).
es_creixent([A, B | T]) :-
    A < B,
    es_creixent([B | T]).

% La llista està en ordre decreixent
es_decreixent([_]).
es_decreixent([A, B | T]) :-
    A > B,
    es_decreixent([B | T]).

% Capgira els elements de la llista
capgirar(L, L2) :-
    capgirar_aux(L, [], L2).
capgirar_aux([], Compt, Compt).
capgirar_aux([H | T], Compt, L2) :-
    capgirar_aux(T, [H | Compt], L2).


% Exercici 5:
% a_intercalar(+L,?L2,Pas)
% L2 es el resultat d’aplicar alguna de les subaccions d’intercalar a L,
%   i Pas conte la tupla que representa l’accio aplicada

% Separar Esquerra
a_intercalar(L, L2, pas_separar_esq(Parells, Senars)) :-
    separar(L, Parells, Senars),
    append(Parells, Senars, L2),
    suma_desplacaments(L, Sum1),
    suma_desplacaments(L2, Sum2),
    Sum1 > Sum2.

% Separar Dreta
a_intercalar(L, L2, pas_separar_dre(Parells, Senars)) :-
    separar(L, Parells, Senars),
    append(Senars, Parells, L2),
    suma_desplacaments(L, Sum1),
    suma_desplacaments(L2, Sum2),
    Sum1 > Sum2.

% Unir Esquerra
a_intercalar(L, L2, pas_unir_esq(Esq, Dre)) :-
    dividir(L, Esq, Dre),
    intercalar(Esq, Dre, 0, L2),
    suma_desplacaments(L, Sum1),
    suma_desplacaments(L2, Sum2),
    Sum1 > Sum2.

% Unir Dreta
a_intercalar(L, L2, pas_unir_dre(Esq, Dre)) :-
    dividir(L, Esq, Dre),
    intercalar(Dre, Esq, 0, L2),
    suma_desplacaments(L, Sum1),
    suma_desplacaments(L2, Sum2),
    Sum1 > Sum2.


dividir(L, Esquerra, Dreta) :-
    length(L, N),
    M is N div 2,
    length(Esquerra, M),
    append(Esquerra, Dreta, L).

%crides un cas amb la posició per on començar a buscar
separar(L, Parells, Senars) :- separar(L, 0, Parells, Senars).

separar([], _I, [], []).

separar([H|T], I, [H|P], S) :-
    0 is I mod 2,
    Seg is I + 1,
    separar(T, Seg, P, S).

separar([H|T], I, P, [H|S]) :-
    1 is I mod 2,
    Seg is I + 1,
    separar(T, Seg, P, S).

% intercalar(L1, L2, index(parell i senars corresponentment), Resultat)
% funcio per anar intercalant desde les dues llistes
intercalar([], [], _I, []).

intercalar([H|T1], L2, I, [H|T]) :-
    0 is I mod 2,
    Seg is I + 1,
    intercalar(L2, T1, Seg, T).

intercalar([H|T1], L2, I, [H|T]) :-
    1 is I mod 2,
    Seg is I + 1,
    intercalar(L2, T1, Seg, T).


% Exercici 6:
% ordenacio_minima(+L,+Accions,?L2,?Pas,−LlistaPassos)
% L2 es la llista L ordenada.
% S’ha ordenat amb una sequencia d’aplicacions de les accions dins de la llista Accions,
%   que pot ser qualsevol subconjunt de {a inserir, a capgirar, a intercalar}.
%   El nombre de passos de la sequencia es el minim possible.
% Pas es el nombre passos aplicats (metrica pas)
% LlistaPassos conte la llista de passos aplicats, per ordre
% El predicat ordenacio minima es demostra una sola vegada

ordenacio_minima(L, _Accions, LlistaOrdenada, 0, []) :-
    llista_ordenada(L, LlistaOrdenada),
    L == LlistaOrdenada,
    !.

ordenacio_minima(L, Accions, LlistaOrdenada, Pas, LlistaPassos) :-
    llista_ordenada(L, LlistaOrdenada),
    L \== LlistaOrdenada,
    aprofundiment_iteratiu(L, LlistaOrdenada, Accions, LlistaPassos),
    length(LlistaPassos, Pas),
    !.

aprofundiment_iteratiu(L, LlistaOrdenada, Accions, LlistaPassos) :-
    aprofundiment_iteratiu(L, LlistaOrdenada, Accions, LlistaPassos, 1).

aprofundiment_iteratiu(L, LlistaOrdenada, Accions, LlistaPassos, Profunditat) :-
    cami(L, LlistaOrdenada, Accions, Profunditat, [], RevSteps),
    llista_reves(RevSteps, LlistaPassos),
    !.
aprofundiment_iteratiu(L, LlistaOrdenada, Accions, LlistaPassos, Profunditat) :-
    NovaProfunditat is Profunditat + 1,
    NovaProfunditat =< 20,
    aprofundiment_iteratiu(L, LlistaOrdenada, Accions, LlistaPassos, NovaProfunditat).

%Cami que condueix a la llista ordenada
cami(Estat, Estat, _Accions, 0, Pasos, Pasos) :-
    !.

cami(Estat, Objectiu, Accions, Profunditat, Acc, Pasos) :-
    Profunditat > 0,
    member(Accio, Accions),
    aplicar_accio(Accio, Estat, Seg, Pas),
    NovaProfunditat is Profunditat - 1,
    cami(Seg, Objectiu, Accions, NovaProfunditat, [Pas|Acc], Pasos).

%Aplicar accio en un pas

aplicar_accio(a_intercalar, Estat, Seg, Pas) :-
    accio(a_intercalar, Estat, Seg, Pas),
    suma_desplacaments(Estat, SumEstat),
    suma_desplacaments(Seg, SumSeg),
    SumSeg < SumEstat.

aplicar_accio(Accio, Estat, Seg, Pas) :-
    Accio \= a_intercalar,
    accio(Accio, Estat, Seg, Pas).

%Crida de les diferents accions individuals
accio(a_inserir, L, LSeg, Pas) :-
    a_inserir(L, LSeg, Pas).

accio(a_capgirar, L, LSeg, Pas) :-
    a_capgirar(L, LSeg, Pas).

accio(a_intercalar, L, LSeg, Pas) :-
    a_intercalar(L, LSeg, Pas).

%Generar llista ordenada

llista_ordenada(L, Ordenada) :-
    length(L, N),
    llista_enumerada(0, N, Ordenada).

llista_enumerada(I, N, []) :-
    I >= N.

llista_enumerada(I, N, [I|Resta]) :-
    I < N,
    I1 is I + 1,
    llista_enumerada(I1, N, Resta).

% Comprovar que esta ordenada
ordenada([]).
ordenada([_]).
ordenada([X, Y | T]) :-
    X =< Y,
    ordenada([Y|T]).

%Funcio auxiliar per invertir una llista
merge([], L, L).
merge(L, [], L).
merge([X|Xs], [Y|Ys], [X|Z]) :-
    X =< Y,
    merge(Xs, [Y|Ys], Z).
merge([X|Xs], [Y|Ys], [Y|Z]) :-
    X > Y,
    merge([X|Xs], Ys, Z).

%Metode per girar una llista
llista_reves(L, R) :-
    girar(L, [], R).
%cas base si la llista es buida ja hem acabat
girar([], Acc, Acc).
%Metode auxiliar per girar la llista
girar([H|T], Acc, R) :-
    girar(T, [H|Acc], R).


% Exercici 7:
% escriure_passos(+L) ==> escriu tots els passos de la llista L
% escriure_pas(+Pas) ==> escriu el pas Pas, que es algun dels vistos en les accions inserir,
%   capgirar i intercalar

% Mostra per pantalla el pas d'inserció
escriure_pas(pas_inserir(P1, P2, Frag, Sufix)) :-
    construir_insercio_original(P1, P2, Frag, Sufix, Orig),
    construir_insercio_resultat(P1, P2, Frag, Sufix, Resultat),
    imprimir_llista(Orig),
    write(' == Inserir ==> '),
    imprimir_llista(Resultat),
    nl.

% Mostra per pantalla el pas de capgirament
escriure_pas(pas_capgirar(P, Frag, Sufix)) :-
    construir_capgirament(P, Frag, Sufix, Orig, Resultat),
    imprimir_llista(Orig),
    write(' ==  Capgirar  ==> '),
    imprimir_llista(Resultat),
    nl.

% Mostra per pantalla el pas de separació esquerra
escriure_pas(pas_separar_esq(Parells, Senars)) :-
    construir_separacio_esq(Parells, Senars, Orig, Resultat),
    imprimir_llista(Orig),
    write(' ==  Intercalar  ==> '),
    imprimir_llista(Resultat),
    nl.

% Mostra per pantalla el pas de separació dreta
escriure_pas(pas_separar_dre(L1, L2)) :-
    construir_separacio_dre(L1, L2, Orig, Resultat),
    imprimir_llista(Orig),
    write(' ==  Intercalar  ==> '),
    imprimir_llista(Resultat),
    nl.

% Mostra per pantalla el pas d'unió esquerra
escriure_pas(pas_unir_esq(L1, L2)) :-
    construir_unio_original(L1, L2, Orig),
    construir_unio_esq(L1, L2, Resultat),
    imprimir_llista(Orig),
    write(' ==  Intercalar  ==> '),
    imprimir_llista(Resultat),
    nl.

% Mostra per pantalla el pas d'unió dreta
escriure_pas(pas_unir_dre(L1, L2)) :-
    construir_unio_original(L1, L2, Orig),
    construir_unio_dre(L1, L2, Resultat),
    imprimir_llista(Orig),
    write(' ==  Intercalar  ==> '),
    imprimir_llista(Resultat),
    nl.

% Envolta un element en forma simple
envoltar_element(X, simple(X)).

% Construeix la llista original per al pas d'inserció
construir_insercio_original(P1, P2, Frag, Sufix, Sortida) :-
    maplist(envoltar_element, P1, P1w),
    maplist(envoltar_element, P2, P2w),
    maplist(envoltar_element, Sufix, Sufixw),
    append(P1w, P2w, Temp),
    append(Temp, [grup(Frag)], Temp2),
    append(Temp2, Sufixw, Sortida).

% Construeix el resultat del pas d'inserció
construir_insercio_resultat(P1, P2, Frag, Sufix, Sortida) :-
    maplist(envoltar_element, P1, P1w),
    maplist(envoltar_element, P2, P2w),
    maplist(envoltar_element, Sufix, Sufixw),
    append(P1w, [grup(Frag)], Temp),
    append(Temp, P2w, Temp2),
    append(Temp2, Sufixw, Sortida).

% Construeix la llista original i el resultat del pas de capgirament
construir_capgirament(P, Frag, Sufix, Orig, Resultat) :-
    maplist(envoltar_element, P, Pw),
    maplist(envoltar_element, Sufix, Sufixw),
    append(Pw, [grup(Frag)], Orig),
    reverse(Frag, FragCapgirat),
    append(Pw, [grup(FragCapgirat)], Temp),
    append(Temp, Sufixw, Resultat).

% Construeix una llista intercalada per a separar per l'esquerra
construir_intercalat_esq([], [], []).
construir_intercalat_esq([E|Es], [O|Os], [grup([E]), simple(O)|Resta]) :-
    construir_intercalat_esq(Es, Os, Resta).

% Construeix la separació esquerra a partir de parells i senars
construir_separacio_esq(Parells, Senars, Orig, Resultat) :-
    construir_intercalat_esq(Parells, Senars, Orig),
    maplist(envoltar_element, Senars, SenarsSimples),
    Resultat = [grup(Parells)|SenarsSimples].

% Construeix una llista intercalada per a separar per la dreta
construir_intercalat_dre([], [], []).
construir_intercalat_dre([X|Xs], [Y|Ys], [simple(X), grup([Y])|Resta]) :-
    construir_intercalat_dre(Xs, Ys, Resta).

% Construeix la separació dreta a partir de dues llistes
construir_separacio_dre(L1, L2, Orig, Resultat) :-
    construir_intercalat_dre(L1, L2, Orig),
    maplist(envoltar_element, L1, L1Simples),
    Resultat = [grup(L2)|L1Simples].

% Construeix la forma original d'una unió
construir_unio_original(L1, L2, Sortida) :-
    maplist(envoltar_element, L2, L2Simples),
    Sortida = [grup(L1)|L2Simples].

% Construeix la unió intercalada començant per L1
construir_intercalat_unio([], [], []).
construir_intercalat_unio([E|Es], [O|Os], [grup([E]), simple(O)|Resta]) :-
    construir_intercalat_unio(Es, Os, Resta).

% Construeix el resultat de la unió per l'esquerra
construir_unio_esq(L1, L2, Sortida) :-
    construir_intercalat_unio(L1, L2, Sortida).

% Construeix la unió intercalada començant per L2
construir_intercalat_unio_dre([], [], []).
construir_intercalat_unio_dre([E|Es], [O|Os], [simple(O), grup([E])|Resta]) :-
    construir_intercalat_unio_dre(Es, Os, Resta).

% Construeix el resultat de la unió per la dreta
construir_unio_dre(L1, L2, Sortida) :-
    construir_intercalat_unio_dre(L1, L2, Sortida).

% Imprimeix una llista amb els elements envoltats
imprimir_llista(L) :-
    write('['),
    imprimir_elements(L),
    write(']').

% Imprimeix els elements d'una llista
imprimir_elements([]).
imprimir_elements([X]) :-
    imprimir_element(X).
imprimir_elements([X|Xs]) :-
    imprimir_element(X),
    (Xs \= [] -> write(',') ; true),
    imprimir_elements(Xs).

% Imprimeix un element simple o un grup
imprimir_element(simple(X)) :-
    write(X).
imprimir_element(grup(L)) :-
    write('('),
    imprimir_grup(L),
    write(')').

% Imprimeix un grup de nombres separat per comes
imprimir_grup([]).
imprimir_grup([X]) :-
    write(X).
imprimir_grup([X|Xs]) :-
    write(X),
    (Xs \= [] -> write(',') ; true),
    imprimir_grup(Xs).

escriure_passos([]) :-
    write('%LlistaPassos = ['), nl,
    write('%]').  % buida

escriure_passos([P]) :-
    write('%LlistaPassos = ['), nl,
    write('%  '), write(P), nl,
    write('%]').

escriure_passos([P|R]) :-
    write('%LlistaPassos = ['), nl,
    escriure_passos_interns([P|R]).

escriure_passos_interns([P]) :-  % últim pas sense coma
    write('%  '), write(P), nl,
    write('%]').

escriure_passos_interns([P|R]) :-
    write('%  '), write(P), write(','), nl,
    escriure_passos_interns(R).

% Exercici 8:
% main ==> sâ€™️executa el programa principal descrit anteriorment

main :-
    write('Llista manual (m) o aleatoria (a) ? '),
    read(Tipus),
    inicialitzar_llista(Tipus, Llista),
    menu(Llista).


inicialitzar_llista(a, Llista) :-
    write('Entra la mida de la llista: '),
    read(Mida),
    write('Entra la llavor:'),
    read(Llavor),
    llista_aleatoria(Mida, Llavor, Llista).

inicialitzar_llista(m, Llista) :-
    write('Entra la llista:'),
    read(Llista).

menu(Llista) :-
    repeat,
    write('Entrar opcio:'), nl,
    mostrar_menu,
    read(Opcio),
    tractar_opcio(Opcio, Llista),
    Opcio == sor,
    !.


mostrar_menu :-
    write('- Escriure llista esc'), nl,
    write('- Calcular desordre amb nombre de desubicats: des'),nl,
    write('- Calcular desordre amb suma de desplacaments: sum'),nl,
    write('- Calcular desordre amb nombre minim de passos: pas'),nl,
    write('- Calcular desordre amb nombre minim de passos i escriure passos: pase'), nl,
    write('- Sortir: sor'), nl.

tractar_opcio(esc, Llista) :-
    write(Llista), nl.

tractar_opcio(des, Llista) :-
    nombre_desubicats(Llista,Des),
    write(Des), nl.

tractar_opcio(sum, Llista) :-
    suma_desplacaments(Llista, Sum),
    write(Sum),nl.

tractar_opcio(pas, Llista) :-
    write('Entra llista accions: '),
    read(Accions),
    ordenacio_minima(Llista, Accions, _, Pas, _),
    write('Solucio trobada amb '), write(Pas), write(' passos'), nl.


tractar_opcio(pase, Llista) :-
    write('Entra llista accions: '),
    read(Accions),
    ordenacio_minima(Llista, Accions, L2, Pas, LlistaPasos),
    write('Llista original: '), write(Llista), nl,
    write(LlistaPasos), nl,
    write('Llista ordenada: '), write(L2), nl,
    write('Solucio trobada amb '), write(Pas), write(' passos'), nl.

tractar_opcio(sor, _) :-
    !.

tractar_opcio(Opcio, _) :-
    \+ member(Opcio, [esc, des, sum, pas, pase, sor]),
    write('opcioinventada.'), nl,
    fail.


% Predicats auxiliars proporcionats

constant_m_rand(65537).
constant_a_rand(75).
constant_c_rand(74).

%treure_nessim(?L,+N,?X,?L2) ==> L2 es la llista L despres d'eliminar el N-essim element, que es X
treure_nessim([X|L],0,X,L):-!.
treure_nessim([X|L],N,Y,[X|L2]):- Nm1 is N-1, treure_nessim(L,Nm1,Y,L2).

%llista_enumerada(+Mida,?L) ==> L = [0,1,2,...,Mida-1]
llista_enumerada(Mida,L):- Nm1 is Mida-1, findall(X,between(0,Nm1,X),L).

%llista_aleatoria(+N,+Llavor,-L)
% L es una permutacio aleatoria de la llista [1,2,...,N], construida a partir de la llavor Llavor
llista_aleatoria(Mida,Llavor,Llista):-
    llista_enumerada(Mida,LlistaOrdenada),
    llista_aleatoria_(Mida,LlistaOrdenada,Llista,Llavor).

%Auxiliar per llista_aleatoria, NO UTILITZAR
llista_aleatoria_(0,[],[],_):-!.
llista_aleatoria_(N,Llista,[X|RestaPermutats],Llavor):-
    Pos is Llavor mod N,
    treure_nessim(Llista,Pos,X,LlistaPermutada),
    constant_m_rand(M),
    constant_a_rand(A),
    constant_c_rand(C),
    RandNext is (A * Llavor + C) mod M,
    Nm1 is N-1,
    llista_aleatoria_(Nm1,LlistaPermutada,RestaPermutats,RandNext).





