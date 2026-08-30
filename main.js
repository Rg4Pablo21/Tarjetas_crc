// main.js
document.addEventListener('DOMContentLoaded', function () {
    // ========== FUNCIONES PRINCIPALES ==========

    function makeFieldEditable(element) {
        element.addEventListener('click', function (e) {
            // Si ya está en modo edición, no hacer nada
            if (this.getAttribute('contenteditable') === 'true') return;
            
            // Guardar contenido original
            const originalContent = this.innerHTML;
            
            this.setAttribute('contenteditable', 'true');
            this.focus();
            
            // Seleccionar todo el contenido
            const range = document.createRange();
            range.selectNodeContents(this);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            
            // Manejar blur (pérdida de foco)
            this.addEventListener('blur', function () {
                this.removeAttribute('contenteditable');
                // Si está vacío, restaurar placeholder
                if (this.textContent.trim() === '') {
                    this.innerHTML = '';
                }
            }, { once: true });
            
            // Manejar teclas
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

    function createFieldRow(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const row = document.createElement('div');
        row.className = 'field-row field-row-new';

        // Definir los campos
        const fields = [
            { label: 'Responsabilidades', placeholder: 'Escribe las responsabilidades...' },
            { label: 'Colaboradores', placeholder: 'Escribe los colaboradores...' },
            { label: 'Pensamiento en objetos', placeholder: 'Describe el pensamiento...' },
            { label: 'Propiedad', placeholder: 'Escribe las propiedades...' }
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
            
            // Hacer editable
            makeFieldEditable(content);
            
            fieldDiv.appendChild(label);
            fieldDiv.appendChild(content);
            row.appendChild(fieldDiv);
        });

        // Botón eliminar
        const deleteDiv = document.createElement('div');
        deleteDiv.style.display = 'flex';
        deleteDiv.style.alignItems = 'center';
        deleteDiv.style.justifyContent = 'center';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-field-btn';
        deleteBtn.innerHTML = '✕';
        deleteBtn.title = 'Eliminar campo';
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

        // Insertar al final del container, antes del botón de añadir
        container.appendChild(row);

        // Enfocar el primer campo después de un breve delay
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

        // Limpiar container
        container.innerHTML = '';

        // Crear campos iniciales
        for (let i = 0; i < numFields; i++) {
            createFieldRow(containerId);
        }
    }

    // ========== INICIALIZAR TARJETAS ==========
    initializeCard('fields-departamento', 2);
    initializeCard('fields-curso', 2);
    initializeCard('fields-libro', 2);

    // ========== EVENTOS PARA AÑADIR CAMPOS ==========
    const addFieldButtons = document.querySelectorAll('.add-field-btn');
    addFieldButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            const target = this.getAttribute('data-target');
            const containerId = `fields-${target}`;
            const newRow = createFieldRow(containerId);
            
            if (newRow) {
                // Resaltar nueva fila
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
                        <span class="superclass">Superclases: —</span>
                        <span class="subclasses">Subclases: —</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="delete-card-btn" title="Eliminar tarjeta">🗑️</button>
                </div>
            </div>
            <div class="card-body">
                <div class="fields-container" id="${containerId}"></div>
                <button class="add-field-btn" data-target="${containerId.replace('fields-', '')}">+ Añadir campo</button>
            </div>
        `;

        const cardsContainer = document.querySelector('.cards-container');
        cardsContainer.appendChild(newCard);

        // Inicializar la nueva tarjeta
        initializeCard(containerId, 2);

        // Configurar eventos
        const newAddBtn = newCard.querySelector('.add-field-btn');
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

        const newDeleteBtn = newCard.querySelector('.delete-card-btn');
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

        newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // ========== DESCARGA PDF ==========
    const downloadBtn = document.getElementById('downloadPdf');

    downloadBtn.addEventListener('click', function () {
        const originalText = this.innerHTML;
        this.innerHTML = '⏳ Generando PDF...';
        this.disabled = true;

        const cardsContainer = document.querySelector('.cards-container');

        // Ocultar elementos que no queremos en el PDF
        const elementsToHide = document.querySelectorAll('.controls, .add-card-container, .add-field-btn, .delete-field-btn, .delete-card-btn, .card-actions');
        const originalDisplay = [];
        elementsToHide.forEach(el => {
            originalDisplay.push(el.style.display);
            el.style.display = 'none';
        });

        // Quitar contenteditable de todas las celdas
        const editableElements = document.querySelectorAll('[contenteditable="true"]');
        editableElements.forEach(el => {
            el.removeAttribute('contenteditable');
        });

        html2canvas(cardsContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: false,
            width: cardsContainer.scrollWidth,
            height: cardsContainer.scrollHeight,
            windowWidth: cardsContainer.scrollWidth,
            windowHeight: cardsContainer.scrollHeight
        }).then(canvas => {
            const { jsPDF } = window.jspdf;

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width * 0.75, canvas.height * 0.75]
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('tarjetas-crc.pdf');

            // Restaurar elementos
            elementsToHide.forEach((el, index) => {
                el.style.display = originalDisplay[index] || '';
            });

            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }).catch(error => {
            console.error('Error al generar PDF:', error);
            alert('Hubo un error al generar el PDF. Por favor, intenta de nuevo.');
            elementsToHide.forEach((el, index) => {
                el.style.display = originalDisplay[index] || '';
            });
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        });
    });
});