class ImageGallery {
    constructor() {
        this.images = [];
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.imageInput = document.getElementById('imageInput');
        this.gallery = document.getElementById('gallery');
        this.modal = document.getElementById('imageModal');
        this.modalImage = document.getElementById('modalImage');
        this.closeModal = document.querySelector('.close-modal');
    }

    attachEventListeners() {
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        this.closeModal.addEventListener('click', () => this.closeModalView());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModalView();
        });
    }

    handleImageUpload(event) {
        const files = Array.from(event.target.files);
        
        files.forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const image = {
                    id: Date.now() + Math.random(),
                    src: e.target.result
                };
                this.images.push(image);
                this.createImageElement(image);
            };
            reader.readAsDataURL(file);
        });
    }

    createImageElement(image) {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.draggable = true;
        div.dataset.id = image.id;

        const img = document.createElement('img');
        img.src = image.src;
        img.alt = 'Gallery image';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteImage(image.id);
        });

        div.appendChild(img);
        div.appendChild(deleteBtn);

        // Add click event for modal view
        div.addEventListener('click', () => this.openModalView(image.src));

        // Add drag and drop events
        div.addEventListener('dragstart', (e) => this.handleDragStart(e));
        div.addEventListener('dragend', (e) => this.handleDragEnd(e));
        div.addEventListener('dragover', (e) => this.handleDragOver(e));
        div.addEventListener('drop', (e) => this.handleDrop(e));

        this.gallery.appendChild(div);
    }

    deleteImage(id) {
        const element = this.gallery.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.remove();
            this.images = this.images.filter(img => img.id !== id);
        }
    }

    openModalView(src) {
        this.modalImage.src = src;
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModalView() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Drag and Drop handlers
    handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.gallery.querySelectorAll('.gallery-item').forEach(item => {
            item.classList.remove('drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        const draggingItem = this.gallery.querySelector('.dragging');
        const siblings = [...this.gallery.querySelectorAll('.gallery-item:not(.dragging)')];
        
        const nextSibling = siblings.find(sibling => {
            const box = sibling.getBoundingClientRect();
            const offset = e.clientY - box.top - box.height / 2;
            return offset < 0;
        });

        siblings.forEach(item => item.classList.remove('drag-over'));
        if (nextSibling) {
            nextSibling.classList.add('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedItem = this.gallery.querySelector(`[data-id="${draggedId}"]`);
        const dropTarget = this.gallery.querySelector('.drag-over');

        if (dropTarget) {
            const draggedIndex = this.images.findIndex(img => img.id === draggedId);
            const dropIndex = this.images.findIndex(img => img.id === dropTarget.dataset.id);

            // Reorder the images array
            const [movedImage] = this.images.splice(draggedIndex, 1);
            this.images.splice(dropIndex, 0, movedImage);

            // Reorder the DOM elements
            if (draggedIndex < dropIndex) {
                dropTarget.parentNode.insertBefore(draggedItem, dropTarget.nextSibling);
            } else {
                dropTarget.parentNode.insertBefore(draggedItem, dropTarget);
            }
        }

        this.gallery.querySelectorAll('.gallery-item').forEach(item => {
            item.classList.remove('drag-over');
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ImageGallery();
}); 