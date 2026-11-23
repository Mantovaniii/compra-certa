# Compra Certa · Pacote 3

| Integrante | RA |
|---|---|
| João Pedro Machado de Almeida | 811804 |
| Enzo Dezem Alves | 801743 |
| Vinícius Marto da Veiga | 821252 |
| Ana Caroline de Souza | 833177 |
| Giovanna Rabello Luciano | 824749 |
| Murilo Oliva Mantovani | 834730 |
| Enzo Corradini | 822915 |

Protótipo da Plataforma Inteligente de Comparação de Preços no Setor Alimentício para a disciplina de Interação Humano-Computador do Departamento de Computação da UFSCar, ministrada pela Profa. Vânia Paula de Almeida Neris.

## Executar localmente

Abra [index.html](index.html) em um navegador moderno. O HTML carrega o CSS e o JavaScript da mesma pasta e funciona diretamente por `file://`, inclusive sem internet. Com um servidor estático, execute a partir da raiz do projeto:

```sh
cd pacote-3
python3 -m http.server 8000
```

No navegador, abra `http://localhost:8000`. HTML, CSS e JavaScript puro são suficientes para executar o protótipo. O servidor é opcional. O navegador pode restringir localização, armazenamento ou área de transferência em arquivos locais. Nesses casos, use a origem manual, o estado em memória e o campo de texto para copiar a lista.

## Guia das telas

| Tela | Como usar |
| --- | --- |
| **Início** · `#inicio` | Tela padrão. Busque pelo nome ou use uma sugestão para ver preços por embalagem e por kg ou litro, distâncias e selos. Use **Todos**, **Sustentáveis**, **Mais Baratos** ou **Mais Próximos**. Clique ou pressione Enter num marcador para consultar loja, status e oferta. Use **Adicionar à lista de compras** para incluir uma embalagem, com confirmação na própria oferta. |
| **Minha lista** · `#lista` | A lista inicial contém arroz, leite e tomate. Digite um nome para ver sugestões com a embalagem. Use ↑/↓ e Enter para escolher, ou separe vários nomes por vírgulas e pressione **Adicionar**. Use os atalhos, ajuste de 1 a 20 embalagens e remova itens. **Desfazer** fica disponível por 12 segundos após uma remoção. Edite a origem, o raio, a data da compra e os filtros antes de comparar. |
| **Comparação de cestas** · `#comparar` | Compare os mercados elegíveis e a divisão entre duas lojas quando houver uma combinação que use ambas. Troque a prioridade de custo total, distância ou origem documentada. Expanda **Produtos e ofertas** para conferir preços, validade e fonte. A estrela alterna o favorito. Planos com itens faltantes exibem cobertura parcial e indicam o que falta. |
| **Detalhes da oferta** · `#produto/<produto>/<loja>` | Confira descrição, categoria, embalagem, preço unitário, validade, evidências e preços nas outras lojas. Consulte endereço, horário, formas de pagamento e práticas de descarte da loja. No **Histórico de preços**, alterne entre **7**, **30** e **90 dias**. Selecione um ponto do gráfico ou use as setas no controle diário para consultar um valor. Os indicadores mostram o menor preço, a média do período e a diferença do preço atual em relação à média. O endereço `#produto/<produto>` abre a primeira oferta cadastrada. **Reportar divergência de preço ou validade** permite revisar e registrar um relato simulado. |
| **Rota e resumo** · `#rota` | Escolha um plano completo na comparação. Confira o mapa, a sequência de saída e paradas, a distância de cada trecho, os itens por loja e os alertas. Desmarque **O destino final é o mesmo que o ponto de partida** para informar a chegada. Os custos, o tempo e a quilometragem são recalculados ao editar o destino ou o transporte. Copie o resumo para compartilhar ou use **Confirmar planejamento** para gravá-lo na sessão. |

No cabeçalho, **Modo Escuro** e **Modo Claro** alternam o tema. **Leitura ampliada** pode ser ativada em ambos.

## Premissas da demonstração

- O catálogo contém nove produtos e três lojas de São Carlos. Inclui uma loja sem oferta de óleo, lotes com desconto próximos do vencimento, validade ausente e preço com atualização superior a 24 horas. As datas são ancoradas no primeiro acesso da sessão para que os cenários continuem demonstráveis. Preços, inventário, evidências, horários, origens aproximadas e percursos são simulados.
- Centro, Santa Felícia, Vila Prado e UFSCar têm distâncias de referência. **Casa** usa Santa Felícia e **Trabalho** usa Vila Prado. Texto livre fora do catálogo mantém o rótulo informado e usa o Centro como aproximação, indicada na interface. A localização do dispositivo, quando solicitada e disponível, escolhe um perfil aproximado. As coordenadas são usadas em memória para essa escolha.
- O raio da comparação usa a distância simulada da origem até cada loja. A rota soma a saída, eventuais trechos entre lojas e a chegada. Por padrão, a chegada é na origem. A duração de carro usa tempos simulados e a caminhada assume 4 km/h. O custo de carro é distância total ÷ consumo × preço por litro. A caminhada tem custo monetário zero. Campos de combustível vazios ou inválidos deixam o total sem estimativa.
- Os mapas SVG são renderizados localmente e representam São Carlos de forma esquemática, com orientação, bairros e vias principais. As linhas e distâncias estimadas servem à comparação do protótipo. Vias de referência consultadas no [mapa urbano da EESC-USP](https://web.set.eesc.usp.br/lamem/imagens/ruas_centrais_campus.pdf) e no [cadastro de vias da Prefeitura de São Carlos](https://saocarlos.sp.gov.br/index.php/transporte-transito/176754-pontos-de-radar.html).
- A cobertura conta tipos de produtos. O subtotal soma preço da embalagem × quantidade. A divisão testa todos os pares elegíveis, prioriza cobertura e escolhe o menor subtotal dos produtos nesses pares. A ordenação por custo considera combustível e dá prioridade a planos completos. Cestas parciais e planos com preços de mais de 24 horas ficam fora do selo de menor custo estimado.
- O Mercado Bairro é a referência de economia para a mesma lista, com os filtros de oferta aplicados. O custo comparativo aparece quando a referência também cobre toda a lista e o deslocamento pode ser estimado. A data da compra determina a elegibilidade de lotes. O prazo de três dias inclui o dia planejado.
- Os cinco filtros cumulativos são **Orgânico certificado**, **Vegano**, **Produtor local**, **Embalagem reciclável / Biodegradável** e **Sem agrotóxicos**. Os selos exibem explicações ao passar o ponteiro. Os detalhes distinguem documento, declaração e informação ausente. A ordenação por origem conta evidências documentadas, e o atalho **Sustentáveis** mostra ofertas com pelo menos um selo entre as elegíveis.
- Os históricos são séries diárias simuladas de até 90 dias por produto e loja. O último ponto coincide com o preço exibido na oferta. As estatísticas e a diferença percentual são calculadas sobre o período selecionado.
- Lista, preferências de busca, destino, relatos e confirmação usam armazenamento de sessão. Favoritos, tema e leitura ampliada usam armazenamento local. **Limpar dados do protótipo**, no rodapé, apaga esses dados mediante confirmação e reinicia a demonstração.

## Rastreabilidade dos requisitos funcionais

| ID | Evidência no protótipo | Personas |
| --- | --- | --- |
| RF01 | Lista com embalagens, aumento e redução de quantidade, remoção e totais atualizados | P1, P2 |
| RF02 | Busca sem distinção de acentos, sugestões com embalagem, termos por vírgula e mensagens para ambiguidades e itens desconhecidos | P1, P2, P4 |
| RF03 | Comparação por embalagem e conversão para R$/kg ou R$/L do mesmo produto | P1, P3, P4 |
| RF04 | Planos individuais e divisão de itens em duas lojas, com cobertura, faltantes e custos | P1, P2 |
| RF05 | Seletor de custo total, proximidade e origem documentada | P1–P4 |
| RF06 | Origem manual e localização opcional, com retorno à entrada manual se a localização falhar | P2, P4 |
| RF07 | Raio de 1, 3, 5 ou 10 km, filtro de lojas abertas e data/hora da consulta simulada. As três lojas da amostra estão abertas | P1, P2 |
| RF08 | Mapa interativo com direção e quilometragem por trecho, lista de paradas, endereços, destino configurável, distância, duração e transporte | P1, P2, P4 |
| RF09 | Consumo e preço editáveis com recálculo imediato, subtotal e economia líquida com referência explícita | P1, P2, P4 |
| RF10 | Data da compra, avisos de validade próxima, lotes vencidos excluídos e validade ausente identificada | P1, P4 |
| RF11 | Detalhes com fonte, data, município para origem local e distinção entre documentação, declaração e dado ausente | P3 |
| RF12 | Cinco filtros independentes de sustentabilidade, selos com explicações e recuperação quando nenhuma cesta completa atende à seleção | P3 |
| RF13 | Fonte e horário, preço regular em lotes promocionais e aviso de preço com mais de 24 horas | P1–P4 |
| RF14 | Estrela acessível, favoritos locais, filtro de favoritos e opção de desfazer remoção | P4 |
| RF15 | Estado preservado entre telas, restauração da oferta que abriu os detalhes e confirmação disponível após recarregar a mesma sessão, quando o armazenamento é permitido | P1–P4 |
| RF16 | Orientação e recuperação em lista vazia, combinação indisponível, filtros restritivos, falta de estimativa e falha de localização ou cópia. A busca usa catálogo local | P1–P4 |
| RF17 | Relato simulado de preço, validade, horário ou origem com revisão e confirmação de recebimento | P1, P3, P4 |
| RF18 | Fluxo completo de consulta e escolha de plano sem cadastro | P1–P4 |
| RF19 | Confirmação de descarte coletivo com foco em **Cancelar** e ação temporária **Desfazer** | P1, P4 |
| RF20 | Resumo revisável com itens, lojas, custos, percurso, alertas, exportação e confirmação de planejamento | P1–P4 |

## Requisitos não funcionais e avaliação

| ID | Evidência no protótipo / avaliação restante |
| --- | --- |
| RNF01 | A lista inicial e a navegação direta permitem executar as tarefas. A taxa de conclusão exige teste com participantes. |
| RNF02 | Atalhos, comparação direta e ordenação por distância reduzem etapas. As metas de tempo exigem cronometragem com participantes. |
| RNF03 | A meta de satisfação depende de questionário e entrevista após a tarefa. |
| RNF04 | Custos, referência e validade têm rótulos explícitos. A compreensão deve ser verificada com os roteiros C1 e C4. |
| RNF05 | Processamento local e atualização síncrona dos controles. As metas quantitativas do Pacote 2 exigem instrumentação no ambiente definido. |
| RNF06 | Semântica, teclado, foco, skip link, diálogos, contraste dos tokens e região viva. Auditoria completa dos critérios aplicáveis e sessão com leitor de tela permanecem pendentes. |
| RNF07 | Layout com reflow a partir de 320 CSS px, fontes em unidades relativas, leitura ampliada e controles principais com alvos de pelo menos 44 × 44 CSS px. |
| RNF08 | Cores, tipografia, estados e componentes recorrentes do Design System do Pacote 2. |
| RNF09 | Preços em centavos, arredondamento na apresentação dos custos, comparações em centavos, dados ausentes identificados e cobertura parcial explícita. |
| RNF10 | Origem manual, solicitação de permissão iniciada pelo usuário e limpeza dos dados locais. A aplicação não faz consultas de rede. |
| RNF11 | Lista e filtros sobrevivem à navegação. A recuperação cobre ausência de ofertas, filtros e falhas de recursos do dispositivo. A meta de falha de consulta em serviço depende da integração futura. |
| RNF12 | Critério de ordenação, cálculo de percurso, referência de economia, procedência e horários explícitos. |

## Roteiros pelas proto-personas

| Persona | Percurso de revisão |
| --- | --- |
| P1 · Mariana Costa (C1) | Complete a cesta, compare por custo total com raio de 5 km, confira o desconto de um lote próximo do vencimento e valide a economia líquida na rota. |
| P2 · Rafael Lima (C2) | Use os três itens iniciais e compare por proximidade com lojas abertas. Confira duração e endereço e compare carro com caminhada. |
| P3 · Luiza Azevedo (C3) | Monte uma cesta com tomate e maçã, combine orgânico e produtor local e abra uma oferta do hortifrúti para verificar procedência e data do documento. |
| P4 · Antônio Ferreira (C4) | Ative **Leitura ampliada**, favorite o Mercado Bairro e filtre por favoritos. Confira a validade, revise a lista e confirme o planejamento. |

Acesse a [lista oficial de requisitos](../pacote-2/01-lista-de-requisitos.md), o [Design System](../pacote-2/02-design-system.md) e o [Design Rationale](../pacote-2/03-design-rationale.md) para consultar os critérios completos do projeto.
