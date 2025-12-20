# AuthPage Code Architecture & Walkthrough

This document provides a detailed technical explanation of the **AuthPage** component in the Reachstakes frontend. The code has been refactored into a **modular architecture** to improve readability, maintainability, and scalability.

---

## 🏗️ Architecture Overview

The authentication logic is split into a **Smart Container** (Controller) and **Dumb Components** (View).

- **`AuthPage.jsx`** (Smart Container): Holds the *brain*. It manages state, handles user input, performs validation, and talks to the backend API.
- **`components/`** (Dumb Components): These handle the *looks*. They receive data via props and render the UI. They don't know about the backend or complex logic.

### File Structure
```text
src/
└── AuthPage/
    ├── AuthPage.jsx            # Main Entry Point & Logic Controller
    ├── CODE_WALKTHROUGH.md     # This documentation
    └── components/
        ├── BackgroundEffects.jsx   # Visual noise, gradients, and animated blobs
        ├── RoleSelector.jsx        # Buttons to toggle between "Brand" and "Creator"
        ├── ModeToggle.jsx          # Tabs to switch between "Login" and "Signup"
        ├── AuthForm.jsx            # The actual form fields (Email, Password, etc.)
        ├── FormInput.jsx           # Reusable individual input field wrapper
        └── SocialLogin.jsx         # "Continue with Google" section
```

---

## 🧠 Component Deep Dive

### 1. `AuthPage.jsx` (The Controller)
This is the parent component. It orchestrates the entire page.

**Key Responsibilities:**
- **State Management**:
  - `role`: Tracks if the user is a `brand` or `creator`.
  - `mode`: Tracks if the user is in `login` or `signup` mode.
  - `formData`: A single object holding all input values (`email`, `password`, `companyName`, etc.).
  - `errors`: Stores validation error messages.
  - `loading`: Disables buttons while talking to the API.

- **Event Handlers**:
  - `handleInputChange`: Updates `formData` dynamically based on the input's `name` attribute. It also clears errors for that specific field as the user types.
  - `handleSubmit`: Prevents default form submission, triggers validation, and sends data to the backend.

- **Dynamic Styling**: 
  - Calculates the background gradient based on the `isBrand` boolean variable to switch between the "Brand Purple" and "Creator Teal" themes.

### 2. `components/AuthForm.jsx` (The Form)
This component renders the actual input fields. It uses **Conditional Rendering** to show/hide fields based on the state.

**Logic Flow:**
- It receives `mode` and `role` as props.
- Uses `framer-motion`'s `<AnimatePresence>` to smoothly animate fields in and out.
- **Example Logic**:
  - *Is it Signup mode?* -> *Yes.*
  - *Is logic Brand?* -> *Yes* -> Show `Company Name` input.
  - *Is logic Creator?* -> *Yes* -> Show `Full Name` input.

### 3. `components/formInput.jsx` (Reusable Input)
A wrapper around the basic HTML `<input>`.

**Features:**
- **Icon Support**: Accepts an `icon` prop (like `Mail`, `Lock`) and renders it inside the input box.
- **Dynamic Colors**: Reacts to the `isBrand` prop to change the focus ring color (Purple vs Teal).
- **Error Handling**: Displays a red error message below the input if the `error` prop is passed.

### 4. `components/RoleSelector.jsx` & `ModeToggle.jsx`
Pure UI components.
- **RoleSelector**: Displays the two main buttons at the top. It mimics a "tabs" interface.
- **ModeToggle**: Simple text buttons to switch valid contexts.

### 5. `components/BackgroundEffects.jsx`
Contains all the "flashy" visual elements to keep the main file clean.
- **Noise Texture**: A subtle grain overlay for a premium feel.
- **Glowing Orbs**: Animated layout blobs that pulse in the background.

---

## 🔄 Data Flow (How it works)

1.  **User Types**: User types in `FormInput` inside `AuthForm`.
2.  **Bubble Up**: The `onChange` event bubbles up to `AuthPage.jsx`.
3.  **State Update**: `authPage` updates its `formData` state.
4.  **Re-render**: React detects the state change and re-renders `AuthPage`, passing the new values back down to `AuthForm` so the user sees what they typed.
5.  **Submission**:
    - User clicks "Sign Up".
    - `handleSubmit` in `AuthPage` runs `validate()`.
    - If valid, `axios` sends a POST request to `/api/auth/register`.
    - Success -> Alert & Switch to Login mode.
    - Error -> Show error message.

## 🎨 Theme System
The app features a **Dual Theme** system controlled by the `role` state.

| Feature | Brand Theme | Creator Theme |
| :--- | :--- | :--- |
| **Primary Color** | Indigo / Violet | Teal / Cyan |
| **Background** | Dark Navy / Deep Purple | Dark Jungle Green / Black |
| **Glow Effects** | Purple Haze | Mint Green Glow |

This is achieved via the `isBrand` boolean helper:
```javascript
const isBrand = role === "brand";
const activeColor = isBrand ? "text-indigo-400" : "text-teal-400";
```
This variable is passed down to components to ensure consistent styling across the app.
