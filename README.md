# Pokedex React app

![React](https://img.shields.io/badge/-React-000000?style=flat-square&logo=React&logoColor=61DAFB)
![React Query](https://img.shields.io/badge/React_Query-%23FF4154.svg?style=flat-square&logo=react-query&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-%23CA4245.svg?style=flat-square&logo=react-router&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white)
![HTML5](https://img.shields.io/badge/-HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)

## Overview

The Pokedex React App is a modern web application designed to provide comprehensive information about Pokemon. Built with the latest web technologies, this app offers a seamless and interactive user experience. The application leverages the power of React for building user interfaces, React Query for data fetching and state management, and React Router for navigation. TypeScript is used to ensure type safety and improve code quality. The app is styled using HTML5 and CSS3, and it is bundled with Vite for fast development and optimized production builds.

## Features

- **Pokemon List**: View a list of all Pokemon
- **Pokemon Details**: View detailed information about a Pokemon, including:
  - Pokedex number
  - Types
  - Base experience
  - Base happiness
  - Capture rate
  - Hatch counter
  - Habitat
  - Moves
  - Alternate forms
- **Responsive Design** that works on both desktop and mobile devices

### Key Technologies

- **React**: A JavaScript library for building user interfaces.
- **React Query**: A data-fetching library that simplifies server state management.
- **React Router**: A library for routing in React applications.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **HTML5 & CSS3**: Standard technologies for structuring and styling web content.
- **Vite**: A build tool that provides a faster and leaner development experience.

### Architecture

The app follows a component-based architecture, where each part of the user interface is encapsulated in a reusable component. This modular approach makes the codebase easier to manage and scale. The state management is handled using React Query, which provides hooks for fetching, caching, and updating data. React Router is used to manage navigation between different views, ensuring a smooth and responsive user experience.

### Data Source

The app uses the [PokeAPI](https://pokeapi.co/) as its primary data source. PokeAPI is a free and open API that provides detailed information about Pokemon, including their attributes, abilities, and evolutions. The app fetches data from various endpoints of the PokeAPI to display a comprehensive set of information about each Pokemon.

### User Interface

The user interface is designed to be intuitive and user-friendly. It features a responsive design that adapts to different screen sizes, ensuring a consistent experience across desktop and mobile devices. The main views include a list of all Pokemon and detailed pages for each Pokemon, showcasing their attributes, stats, and other relevant information.

### Performance

The app is optimized for performance using Vite, which provides fast hot module replacement (HMR) during development and efficient bundling for production. React Query's caching mechanism also helps in reducing redundant network requests, improving the overall performance and responsiveness of the app.

### Future Enhancements

Future enhancements for the app may include features such as:

- **Search and Filter**: Allowing users to search for Pokemon by name or filter them by type, generation, etc.
- **Favorites**: Enabling users to mark their favorite Pokemon and access them quickly.
- **Battle Simulator**: Adding a feature to simulate battles between different Pokemon.
- **User Accounts**: Implementing user authentication and profiles to save preferences and progress.

## Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and update the environment variables if necessary
3. Run `npm install`
4. Run `npm run dev`

## Environment Variables

The following environment variables are used in the project:

- `VITE_POKEMON_API_BASE_URL`: Base URL for the PokeAPI
- `VITE_POKEMON_SPRITES_BASE_URL`: Base URL for Pokemon sprites
- `VITE_POKEMON_ARTWORK_BASE_URL`: Base URL for official artwork
- `VITE_POKEMON_CRIES_BASE_URL`: Base URL for Pokemon cries

## Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the project for production
- `npm run lint`: Run ESLint to check for linting errors
- `npm run preview`: Preview the production build

## License

This project is open source and available under the [MIT License](LICENSE).
