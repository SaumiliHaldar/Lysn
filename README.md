# Lysn

This repository contains the source code for Lysn, an advanced AI-powered platform designed to transform static PDF documents into immersive audio experiences. Integrated with a modern web interface, Lysn delivers high-quality, natural-sounding audio, offering personalized library management and seamless playback controls.

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Machine Learning Models](#machine-learning-models)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About the Project

Lysn is an innovative PDF-to-Audio platform that empowers users to listen to their documents anytime, anywhere. By leveraging advanced Text-to-Speech technology, it converts written content into natural speech, making information more accessible and convenient for students, professionals, and avid readers.

## Features

- **Instant PDF Conversion**: Upload any PDF and watch it transform into a clear, structured audio script in seconds.
- **Natural AI Voices**: Powered by Google Text-to-Speech (gTTS) for a human-like listening experience.
- **Cloud Library**: Your generated audios are stored securely in the cloud, accessible from any device.
- **Secure Authentication**: Supports both manual email/password login with OTP verification and seamless Google OAuth integration.
- **Smart Playback**: Stream audio with precision control, including background play, progress tracking, and duration display.
- **Automated Communication**: Welcome emails and OTPs integrated with Google Apps Script for reliable delivery.

## Technologies Used

- **FastAPI**: Web framework for building high-performance, asynchronous APIs.
- **Python**: Core programming language for backend logic and audio processing.
- **Next.js (with TypeScript)**: React framework for building a fast, SEO-friendly, and interactive frontend.
- **MongoDB & GridFS**: NoSQL database for flexible data storage and handling large audio files.
- **gTTS (Google Text-to-Speech)**: Converts extracted text into high-quality speech.
- **PyPDF2**: Robust PDF text extraction.
- **Tailwind CSS**: Utility-first CSS framework for stunning, responsive designs.
- **Framer Motion**: Library for creating smooth, complex animations.
- **Google Apps Script**: Backend integration for sending automated emails.

## Installation

### Backend Setup

1. **Clone the repository**:
    ```bash
    git clone https://github.com/SaumiliHaldar/Lysn.git
    cd Lysn/backend
    ```
2. **Create a virtual environment & activate it**:
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```
3. **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4. **Create a `.env` file** in the `backend` directory:
    ```env
    MONGO_URI=your_mongodb_uri
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    REDIRECT_URI=http://localhost:8000/auth/google/callback
    ALLOWED_ORIGINS=http://localhost:3000
    GOOGLE_SCRIPT_URL=your_google_apps_script_url
    ```
5. **Run the application**:
    ```bash
    uvicorn app:app --reload
    ```

### Frontend Setup

1. **Navigate to the frontend directory**:
    ```bash
    cd ../frontend
    ```
2. **Install dependencies**:
    ```bash
    npm install
    ```
3. **Create a `.env.local` file**:
    ```env
    NEXT_PUBLIC_API_URL=your_backend_url.com
    ```
4. **Run the development server**:
    ```bash
    npm run dev
    ```

## Usage

- **Access the Platform**: Open [http://localhost:3000](http://localhost:3000).
- **Sign Up/Login**: Use your email (OTP verification) or sign in with Google.
- **Upload & Listen**: Upload your PDF documents and start listening immediately.

## Machine Learning Models

### Text-to-Speech
- **gTTS (Google Text-to-Speech)**: Interfaces with Google Translate's text-to-speech API to generate spoken audio data.

### Text Extraction
- **PyPDF2**: A pure-Python library built as a PDF toolkit for extracting text from PDF files.

## Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

Lysn is licensed under the MIT License.

## Contact

For any questions or feedback, please reach out to:

**Name**: Saumili Haldar  
**Email**: haldar.saumili843@gmail.com
