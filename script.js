// Initialisation
        document.addEventListener('DOMContentLoaded', () => {
            const notes = JSON.parse(localStorage.getItem('notes')) || [];
            renderNotes(notes);
            
            // Événements
            document.getElementById('add-btn').addEventListener('click', addNote);
            document.getElementById('export-all').addEventListener('click', exportAllNotes);
            document.getElementById('search').addEventListener('input', searchNotes);
        });

        // Ajouter une nouvelle note
        function addNote() {
            const title = document.getElementById('title').value.trim();
            const content = document.getElementById('content').value.trim();
            const tagsInput = document.getElementById('tags').value.trim();
            
            if (!title || !content) {
                alert('Veuillez remplir le titre et le contenu');
                return;
            }
            
            const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
            
            const newNote = {
                id: Date.now(),
                title,
                content,
                tags,
                createdAt: new Date().toISOString()
            };
            
            const notes = JSON.parse(localStorage.getItem('notes')) || [];
            notes.push(newNote);
            localStorage.setItem('notes', JSON.stringify(notes));
            
            renderNotes(notes);
            
            // Réinitialiser le formulaire
            document.getElementById('title').value = '';
            document.getElementById('content').value = '';
            document.getElementById('tags').value = '';
        }

        // Afficher les notes
        function renderNotes(notesArray) {
            const container = document.getElementById('notes-container');
            const emptyMsg = document.getElementById('empty-message');
            
            container.innerHTML = '';
            
            if (notesArray.length === 0) {
                emptyMsg.classList.remove('hidden');
                container.appendChild(emptyMsg);
                return;
            }
            
            emptyMsg.classList.add('hidden');
            
            notesArray.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.className = 'note-card';
                noteElement.dataset.id = note.id;
                
                noteElement.innerHTML = `
                    <h3 class="note-title">${note.title}</h3>
                    <div class="note-content">${note.content}</div>
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="note-actions">
                        <button class="btn btn-small btn-export export-single">Exporter en PDF</button>
                    </div>
                `;
                
                container.appendChild(noteElement);
            });
            
            // Ajouter les écouteurs pour l'export individuel
            document.querySelectorAll('.export-single').forEach(btn => {
                btn.addEventListener('click', function() {
                    const noteId = this.closest('.note-card').dataset.id;
                    const notes = JSON.parse(localStorage.getItem('notes')) || [];
                    const note = notes.find(n => n.id == noteId);
                    if (note) exportNoteToPDF(note);
                });
            });
        }

        // Recherche de notes
        function searchNotes() {
            const searchTerm = document.getElementById('search').value.toLowerCase();
            const notes = JSON.parse(localStorage.getItem('notes')) || [];
            
            if (!searchTerm) {
                renderNotes(notes);
                return;
            }
            
            const filteredNotes = notes.filter(note => 
                note.title.toLowerCase().includes(searchTerm) ||
                note.content.toLowerCase().includes(searchTerm) ||
                note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
            
            renderNotes(filteredNotes);
        }

        // Exporter une note en PDF
        function exportNoteToPDF(note) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Style amélioré pour le PDF
            doc.setFontSize(20);
            doc.setTextColor(40, 40, 40);
            doc.text(note.title, 15, 15);
            
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Créée le: ${new Date(note.createdAt).toLocaleDateString()}`, 15, 25);
            
            doc.setFontSize(14);
            doc.setTextColor(30, 30, 30);
            const splitContent = doc.splitTextToSize(note.content, 180);
            doc.text(splitContent, 15, 35);
            
            // Ajout des tags
            if (note.tags.length > 0) {
                doc.setFontSize(12);
                doc.setTextColor(52, 152, 219);
                doc.text(`Tags: ${note.tags.join(', ')}`, 15, doc.autoTable.previous.finalY + 10);
            }
            
            doc.save(`note-${note.title}.pdf`);
        }

        // Exporter toutes les notes en PDF
        function exportAllNotes() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const notes = JSON.parse(localStorage.getItem('notes')) || [];
            
            if (notes.length === 0) {
                alert("Aucune note à exporter");
                return;
            }
            
            let yPosition = 15;
            
            notes.forEach((note, index) => {
                if (index > 0) doc.addPage();
                
                doc.setFontSize(20);
                doc.text(note.title, 15, yPosition);
                yPosition += 10;
                
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(`Créée le: ${new Date(note.createdAt).toLocaleDateString()}`, 15, yPosition);
                yPosition += 10;
                
                doc.setFontSize(12);
                doc.setTextColor(30);
                const splitContent = doc.splitTextToSize(note.content, 180);
                doc.text(splitContent, 15, yPosition);
                yPosition = doc.autoTable.previous.finalY + 5;
                
                if (note.tags.length > 0) {
                    doc.setFontSize(10);
                    doc.setTextColor(52, 152, 219);
                    doc.text(`Tags: ${note.tags.join(', ')}`, 15, yPosition);
                    yPosition += 10;
                }
                
                // Réinitialiser pour la prochaine note
                yPosition = 15;
            });
            
            doc.save('toutes-les-notes.pdf');
        }