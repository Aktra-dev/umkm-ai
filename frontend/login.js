const SUPABASE_URL = "https://sfuqendhpytrooiaazzb.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmdXFlbmRocHl0cm9vaWFhenpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODM0NjQsImV4cCI6MjA5NjA1OTQ2NH0.Wn0FUJhrkNioSPbp0JSyIy0MvbKRkwfee8ORoD8FHrQ";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

async function register() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const { error } =
        await supabase.auth.signUp({
            email,
            password
        });

    if (error) {
        alert(error.message);
        return;
    }

    alert("Register berhasil");
    window.location.href = "login.html";
}

async function login() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const { error } =
        await supabase.auth.signInWithPassword({
            email,
            password
        });

    if (error) {
        alert(error.message);
        return;
    }

    alert("Login berhasil");
    window.location.href = "index.html";
}