document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");

    function navigate(path) {
        history.pushState(null, "", path);
        renderContent(path);
    }

    async function renderContent(path = window.location.pathname) {

        if (path === "/") {
            const html = await fetch("/templates/contacts-list").then(res => res.text());
            app.innerHTML = html;

        } else if (path === "/add") {
            const html = await fetch("/templates/add-contact").then(res => res.text());
            app.innerHTML = html;
            setupAddForm();

        } else if (path.startsWith("/edit/")) {
            const id = parseInt(path.split("/")[2]);
            const html = await fetch(`/templates/edit-contact/${id}`).then(res => res.text());
            app.innerHTML = html;
            setupEditForm(id);

        } else {
            app.innerHTML = "<h2>404 — Страница не найдена</h2>";
        }
    }

    function setupAddForm() {
        const form = document.getElementById("addForm");
        if (!form) return;

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            await fetch("/api/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            navigate("/");
        });
    }

    function setupEditForm(id) {
        const form = document.getElementById("editForm");
        const deleteBtn = document.getElementById("deleteBtn");

        if (deleteBtn) {
            deleteBtn.disabled = false;
            const inputs = form.querySelectorAll("input[type='text']");
            inputs.forEach(input => {
                input.addEventListener("input", () => {
                    deleteBtn.disabled = true;
                });
            });

            deleteBtn.onclick = async () => {
                await fetch(`/api/contacts/${id}`, { method: "DELETE" });
                navigate("/");
            };
        }

        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                await fetch(`/api/contacts/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
                navigate("/");
            });
        }
    }

    window.navigate = navigate;
    window.editContact = (id) => navigate(`/edit/${id}`);

    window.onpopstate = () => {
        renderContent(window.location.pathname);
    };

    renderContent();
});