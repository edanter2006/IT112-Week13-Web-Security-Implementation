const userForm = document.getElementById("userForm");
const userList = document.getElementById("userList");
const msg = document.getElementById("msg");

function showMessage(text, type = "success") {
    msg.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
    setTimeout(() => (msg.innerHTML = ""), 2500);
}

async function loadOrders() {
    try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        console.log(data);
    } catch (err) {
        console.error("Error loading orders:", err);
    }
}
loadOrders();

async function loadUsers() {
    try {
        const res = await fetch("/api/users");
        const users = await res.json();
        
        userList.innerHTML = "";

        if (!users || users.length === 0) {
            userList.innerHTML = '<div class="text-muted p-2">No users found.</div>';
            return;
        }

        users.forEach(u => {
            const item = document.createElement("div");
            item.className = "list-group-item d-flex justify-content-between align-items-center";
            // Check for either username or name so it displays correctly
            const displayName = u.username || u.name || "Unknown User";
            
            item.innerHTML = `
                <div>
                    <div class="fw-semibold">${displayName}</div>
                    <div class="text-muted">${u.email}${u.age ? " • Age " + u.age : ""}</div>
                </div>
                <button class="btn btn-sm btn-outline-danger">Delete</button>
            `;

            item.querySelector("button").addEventListener("click", async () => {
                await fetch(`/api/users/${u._id}`, { method: "DELETE" });
                showMessage("User deleted", "warning");
                loadUsers();
            });

            userList.appendChild(item);
        });
    } catch (err) {
        console.error("Error loading users:", err);
        userList.innerHTML = '<div class="text-danger p-2">Failed to load users.</div>';
    }
}

userForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(userForm);
    
    // Map the form's "name" input to "username" and provide a default password if required by the model
    const payload = {
        username: formData.get("name"),
        email: formData.get("email"),
        password: "TempPassword123!", // Satisfies backend password requirement
    };
    
    const ageVal = formData.get("age");
    if (ageVal && ageVal !== "") {
        payload.age = Number(ageVal);
    }

    const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
        showMessage(data.error || data.message || "Failed to save", "danger");
        return;
    }

    userForm.reset();
    showMessage("User saved!");
    loadUsers();
});

loadUsers();