// main.js
document.addEventListener('DOMContentLoaded', function () {
    // ========== FUNCIONES PRINCIPALES ==========

    function makeFieldEditable(element) {
        element.addEventListener('click', function (e) {
            if (this.getAttribute('contenteditable') === 'true') return;
            
            const originalContent = this.innerHTML;
            
            this.setAttribute('contenteditable', 'true');
            this.focus();
            
            const range = document.createRange();
            range.selectNodeContents(this);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            
            this.addEventListener('blur', function () {
                this.removeAttribute('contenteditable');
                if (this.textContent.trim() === '') {
                    this.innerHTML = '';
                }
            }, { once: true });
            
            this.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.blur();
                }
                if (e.key === 'Escape') {
                    this.innerHTML = originalContent;
                    this.blur();
                }
            }, { once: true });
        });
    }

    function makeMetaEditable(element) {
        element.addEventListener('click', function (e) {
            if (this.getAttribute('contenteditable') === 'true') return;
            
            const hasList = this.querySelector('ul');
            const originalContent = this.innerHTML;
            
            this.setAttribute('contenteditable', 'true');
            this.focus();
            
            if (hasList && this.textContent.trim() === '') {
                this.innerHTML = '';
            }
            
            const range = document.createRange();
            range.selectNodeContents(this);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            
            this.addEventListener('blur', function () {
                this.removeAttribute('contenteditable');
                if (this.textContent.trim() === '') {
                    this.innerHTML = '—';
                }
                formatMetaAsList(this);
            }, { once: true });
            
            this.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.blur();
                }
                if (e.key === 'Escape') {
                    this.innerHTML = originalContent;
                    this.blur();
                }
            }, { once: true });
        });
    }

    function formatMetaAsList(element) {
        const text = element.textContent.trim();
        if (!text || text === '—' || text === '') return;
        
        if (element.querySelector('ul')) return;
        
        if (text.includes(',')) {
            const items = text.split(',').map(item => item.trim()).filter(item => item);
            if (items.length > 1) {
                const ul = document.createElement('ul');
                items.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    ul.appendChild(li);
                });
                element.innerHTML = '';
                element.appendChild(ul);
            }
        }
    }

    function createFieldRow(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const row = document.createElement('div');
        row.className = 'field-row field-row-new';

        const fields = [
            { label: 'Responsabilidades', placeholder: '' },
            { label: 'Colaboradores', placeholder: '' },
            { label: 'Pensamiento en objetos', placeholder: '' },
            { label: 'Atributo(Propiedad)', placeholder: '' }
        ];

        fields.forEach(field => {
            const fieldDiv = document.createElement('div');
            
            const label = document.createElement('span');
            label.className = 'field-label';
            label.textContent = field.label;
            
            const content = document.createElement('div');
            content.className = 'field-content';
            content.textContent = '';
            content.setAttribute('data-placeholder', field.placeholder);
            
            makeFieldEditable(content);
            
            fieldDiv.appendChild(label);
            fieldDiv.appendChild(content);
            row.appendChild(fieldDiv);
        });

        const deleteDiv = document.createElement('div');
        deleteDiv.style.display = 'flex';
        deleteDiv.style.alignItems = 'center';
        deleteDiv.style.justifyContent = 'center';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-field-btn';
        deleteBtn.innerHTML = '✕';
        deleteBtn.title = 'Eliminar fila';
        deleteBtn.addEventListener('click', function (e) {
            const row = this.closest('.field-row');
            if (row) {
                row.style.transition = 'all 0.2s';
                row.style.opacity = '0';
                row.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    row.remove();
                }, 200);
            }
        });
        
        deleteDiv.appendChild(deleteBtn);
        row.appendChild(deleteDiv);

        container.appendChild(row);

        setTimeout(() => {
            const firstContent = row.querySelector('.field-content');
            if (firstContent) {
                firstContent.setAttribute('contenteditable', 'true');
                firstContent.focus();
                firstContent.addEventListener('blur', function () {
                    this.removeAttribute('contenteditable');
                }, { once: true });
            }
        }, 100);

        return row;
    }

    function initializeCard(containerId, numFields = 3) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        for (let i = 0; i < numFields; i++) {
            createFieldRow(containerId);
        }
    }

    // ========== FUNCIONES PARA GUARDAR Y CARGAR ==========

    function exportData() {
        const data = {
            cards: []
        };

        document.querySelectorAll('.card').forEach(card => {
            const cardData = {
                name: card.querySelector('.class-name')?.textContent || '',
                superclass: '',
                subclass: '',
                rows: []
            };

            // Obtener superclases y subclases
            const superclassEl = card.querySelector('.meta-item:first-child .meta-value');
            const subclassEl = card.querySelector('.meta-item:last-child .meta-value');
            
            if (superclassEl) {
                const text = superclassEl.textContent.trim();
                cardData.superclass = text !== '—' ? text : '';
            }
            
            if (subclassEl) {
                const text = subclassEl.textContent.trim();
                cardData.subclass = text !== '—' ? text : '';
            }

            // Obtener filas
            card.querySelectorAll('.field-row').forEach(row => {
                const rowData = [];
                row.querySelectorAll('.field-content').forEach(content => {
                    rowData.push(content.textContent.trim());
                });
                if (rowData.some(cell => cell !== '')) {
                    cardData.rows.push(rowData);
                }
            });

            if (cardData.name) {
                data.cards.push(cardData);
            }
        });

        return data;
    }

    function loadData(data) {
        if (!data || !data.cards || data.cards.length === 0) {
            alert('El archivo no contiene datos válidos.');
            return;
        }

        // Limpiar todas las tarjetas excepto las que coincidan con los nombres
        const cardsContainer = document.querySelector('.cards-container');
        const existingCards = cardsContainer.querySelectorAll('.card');
        
        // Crear un mapa de tarjetas existentes por nombre
        const cardMap = new Map();
        existingCards.forEach(card => {
            const name = card.querySelector('.class-name')?.textContent || '';
            cardMap.set(name, card);
        });

        // Procesar cada tarjeta del archivo
        data.cards.forEach(cardData => {
            let card = cardMap.get(cardData.name);
            
            if (card) {
                // Actualizar tarjeta existente
                updateCardData(card, cardData);
            } else {
                // Crear nueva tarjeta
                createCardFromData(cardData);
            }
        });

        // Re-inicializar meta campos
        initializeMetaFields();
    }

    function updateCardData(card, cardData) {
        // Actualizar superclases y subclases
        const superclassEl = card.querySelector('.meta-item:first-child .meta-value');
        const subclassEl = card.querySelector('.meta-item:last-child .meta-value');
        
        if (superclassEl) {
            superclassEl.textContent = cardData.superclass || '—';
            formatMetaAsList(superclassEl);
        }
        
        if (subclassEl) {
            subclassEl.textContent = cardData.subclass || '—';
            formatMetaAsList(subclassEl);
        }

        // Actualizar filas
        const container = card.querySelector('.fields-container');
        if (container) {
            container.innerHTML = '';
            cardData.rows.forEach(rowData => {
                const newRow = createFieldRow(container.id);
                if (newRow) {
                    const contents = newRow.querySelectorAll('.field-content');
                    contents.forEach((content, index) => {
                        if (rowData[index] !== undefined) {
                            content.textContent = rowData[index];
                        }
                    });
                }
            });
        }
    }

    function createCardFromData(cardData) {
        const cardName = cardData.name;
        const containerId = `fields-${cardName.toLowerCase().replace(/\s+/g, '-')}`;

        const newCard = document.createElement('div');
        newCard.className = 'card card-new';
        newCard.id = `card-${cardName.toLowerCase().replace(/\s+/g, '-')}`;

        newCard.innerHTML = `
            <div class="card-header">
                <div class="header-left">
                    <h2 class="class-name">${cardName}</h2>
                    <div class="meta-info">
                        <div class="meta-item">
                            <span class="meta-label">Superclases:</span>
                            <span class="meta-value" contenteditable="false" id="superclass-${cardName.toLowerCase().replace(/\s+/g, '-')}">${cardData.superclass || '—'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Subclases:</span>
                            <span class="meta-value" contenteditable="false" id="subclass-${cardName.toLowerCase().replace(/\s+/g, '-')}">${cardData.subclass || '—'}</span>
                        </div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="delete-card-btn" title="Eliminar tarjeta">🗑️</button>
                </div>
            </div>
            <div class="card-body">
                <div class="fields-container" id="${containerId}"></div>
                <button class="add-field-btn" data-target="${containerId.replace('fields-', '')}">+ Añadir fila</button>
            </div>
        `;

        const cardsContainer = document.querySelector('.cards-container');
        cardsContainer.appendChild(newCard);

        // Inicializar las filas
        const container = newCard.querySelector('.fields-container');
        if (container) {
            cardData.rows.forEach(rowData => {
                const newRow = createFieldRow(container.id);
                if (newRow) {
                    const contents = newRow.querySelectorAll('.field-content');
                    contents.forEach((content, index) => {
                        if (rowData[index] !== undefined) {
                            content.textContent = rowData[index];
                        }
                    });
                }
            });
        }

        // Configurar eventos
        setupCardEvents(newCard);
    }

    function setupCardEvents(card) {
        const newAddBtn = card.querySelector('.add-field-btn');
        if (newAddBtn) {
            newAddBtn.addEventListener('click', function (e) {
                const target = this.getAttribute('data-target');
                const containerId = `fields-${target}`;
                const newRow = createFieldRow(containerId);
                if (newRow) {
                    newRow.style.background = '#f0f7ff';
                    setTimeout(() => {
                        newRow.style.background = '';
                    }, 400);
                }
            });
        }

        const newDeleteBtn = card.querySelector('.delete-card-btn');
        if (newDeleteBtn) {
            newDeleteBtn.addEventListener('click', function (e) {
                const card = this.closest('.card');
                if (card) {
                    const name = card.querySelector('.class-name')?.textContent || 'tarjeta';
                    if (confirm(`¿Eliminar la tarjeta "${name}"?`)) {
                        card.style.transition = 'all 0.3s';
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.9)';
                        setTimeout(() => {
                            card.remove();
                        }, 300);
                    }
                }
            });
        }
    }

    // ========== INICIALIZAR META CAMPOS ==========
    function initializeMetaFields() {
        const metaValues = document.querySelectorAll('.meta-value');
        metaValues.forEach(el => {
            makeMetaEditable(el);
            formatMetaAsList(el);
        });
    }

    // ========== INICIALIZAR TARJETAS ==========
    initializeCard('fields-departamento', 2);
    initializeCard('fields-curso', 2);
    initializeCard('fields-libro', 2);
    initializeMetaFields();

    // ========== EVENTOS PARA AÑADIR CAMPOS ==========
    const addFieldButtons = document.querySelectorAll('.add-field-btn');
    addFieldButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            const target = this.getAttribute('data-target');
            const containerId = `fields-${target}`;
            const newRow = createFieldRow(containerId);
            
            if (newRow) {
                newRow.style.background = '#f0f7ff';
                setTimeout(() => {
                    newRow.style.background = '';
                }, 400);
            }
        });
    });

    // ========== ELIMINAR TARJETA ==========
    const deleteCardButtons = document.querySelectorAll('.delete-card-btn');
    deleteCardButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            const card = this.closest('.card');
            if (card) {
                const cardName = card.querySelector('.class-name')?.textContent || 'tarjeta';
                if (confirm(`¿Eliminar la tarjeta "${cardName}"?`)) {
                    card.style.transition = 'all 0.3s';
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        card.remove();
                    }, 300);
                }
            }
        });
    });

    // ========== AÑADIR NUEVA TARJETA ==========
    const addCardBtn = document.getElementById('addCardBtn');
    addCardBtn.addEventListener('click', function () {
        const cardName = prompt('Nombre de la nueva tarjeta:', `Nueva tarjeta ${document.querySelectorAll('.card').length + 1}`);
        if (!cardName) return;

        const newCard = document.createElement('div');
        newCard.className = 'card card-new';

        const cardId = `card-${cardName.toLowerCase().replace(/\s+/g, '-')}`;
        newCard.id = cardId;

        const containerId = `fields-${cardName.toLowerCase().replace(/\s+/g, '-')}`;

        newCard.innerHTML = `
            <div class="card-header">
                <div class="header-left">
                    <h2 class="class-name">${cardName}</h2>
                    <div class="meta-info">
                        <div class="meta-item">
                            <span class="meta-label">Superclases:</span>
                            <span class="meta-value" contenteditable="false" id="superclass-${cardName.toLowerCase().replace(/\s+/g, '-')}">—</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Subclases:</span>
                            <span class="meta-value" contenteditable="false" id="subclass-${cardName.toLowerCase().replace(/\s+/g, '-')}">—</span>
                        </div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="delete-card-btn" title="Eliminar tarjeta">🗑️</button>
                </div>
            </div>
            <div class="card-body">
                <div class="fields-container" id="${containerId}"></div>
                <button class="add-field-btn" data-target="${containerId.replace('fields-', '')}">+ Añadir fila</button>
            </div>
        `;

        const cardsContainer = document.querySelector('.cards-container');
        cardsContainer.appendChild(newCard);

        initializeCard(containerId, 2);
        initializeMetaFields();
        setupCardEvents(newCard);

        newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // ========== EXPORTAR DATOS ==========
    document.getElementById('exportFileBtn').addEventListener('click', function () {
        const data = exportData();
        if (data.cards.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tarjetas_crc.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // ========== CARGAR ARCHIVO ==========
    document.getElementById('loadFileBtn').addEventListener('click', function () {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const data = JSON.parse(event.target.result);
                loadData(data);
                alert('Archivo cargado correctamente.');
            } catch (error) {
                alert('Error al cargar el archivo: ' + error.message);
            }
        };
        reader.readAsText(file);
        this.value = '';
    });

    // ========== DESCARGA PDF CON MEJOR CALIDAD ==========
    const downloadBtn = document.getElementById('downloadPdf');

    downloadBtn.addEventListener('click', function () {
        const originalText = this.innerHTML;
        this.innerHTML = '⏳ Generando PDF...';
        this.disabled = true;

        const cardsContainer = document.querySelector('.cards-container');

        // Guardar estado de contenteditable
        const editableElements = document.querySelectorAll('[contenteditable="true"]');
        editableElements.forEach(el => {
            el.removeAttribute('contenteditable');
        });

        // Mejorar la captura para mayor calidad
        html2canvas(cardsContainer, {
            scale: 3, // Mayor calidad (3x)
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: false,
            width: cardsContainer.scrollWidth,
            height: cardsContainer.scrollHeight,
            windowWidth: cardsContainer.scrollWidth,
            windowHeight: cardsContainer.scrollHeight,
            onclone: function(clonedDoc) {
                // Mejorar la legibilidad en el clon
                const allElements = clonedDoc.querySelectorAll('*');
                allElements.forEach(el => {
                    // Asegurar que los textos sean legibles
                    if (el.style) {
                        el.style.textRendering = 'geometricPrecision';
                        el.style.webkitFontSmoothing = 'antialiased';
                    }
                });
            }
        }).then(canvas => {
            const { jsPDF } = window.jspdf;

            const imgData = canvas.toDataURL('image/png', 1.0); // Calidad máxima
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width * 0.9, canvas.height * 0.9],
                compress: false // Sin compresión para mejor calidad
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            pdf.save('tarjetas-crc.pdf');

            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }).catch(error => {
            console.error('Error al generar PDF:', error);
            alert('Hubo un error al generar el PDF. Por favor, intenta de nuevo.');
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        });
    });
});