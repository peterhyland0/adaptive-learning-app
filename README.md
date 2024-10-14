### To get set-up:

1. Clone the repo.
2. At top level directory run `npm install`.
3. Create package.json file with necessary dependencies etc.
4. Then in the same directory run `npx expo prebuild --platform android`.
5. Open Android Studio at the 'android' directory level and sync the project.
6. At top level directory with your android device connected run
   `adb reverse tcp:8081 tcp:8081` to set the connection to the correct port.
7. Then in the same directory run `npx expo start`.
8. In Android Studio run the application and expo metro will bundle and run the app.
9. Edit & save to update on-device.
10. After installation of any additional libraries (with 'npm install ...'), re-sync libraries in android
    and repeat steps to run.
11. Access EXPO_PUBLIC_SERVER_URL from .env file for API calls via `process.env.EXPO_PUBLIC_SERVER_URL`.

### Additional set-up of project...

1. Created a src folder that will contain the project code.
2. Created a ui folder (user interface) which will contain different components and screens.
3. Inside of screens I created a splashScreen which will load the different apis/request permissions needed to gather the users information
4. I created a flowManagementScreen directory which contains a flowManagement file, this file will be used to make the 
   different subScreenViews visible or not, changing screen will declare the subView true if it is to be seen or false 
   to hide it. This will also allow the state to be managed between views.
5. Created a session context file that will update the session context of the user, allowing it to be updated in the 
   database after the session commences.
6. Created api directory to store the different api calls that will be necessary.

## File: `App.js`

This file sets up the main structure of the app, managing navigation and session data.

### Imports
- `React`, `Component`: For creating the app's root component.
- `createNativeStackNavigator`: For managing screen navigation in a stack format.
- `NavigationContainer`: Wraps the navigation logic for the app.
- `SessionContext`: Provides global session data across the app.

### Navigation
- The `Stack.Navigator` is used to manage screen transitions.
- `initialRouteName` is set to `"SplashScreen"`, which is the first screen the app displays.
- Headers are hidden for all screens with `headerShown: false`.

### Context Provider
- The app is wrapped in `SessionContext.Provider` to make session data available to all components.

### Adding Screens
- Screens can be added within the `Stack.Navigator` using the following format:

<Stack.Screen name="ScreenName" component={ScreenComponent} />


## File: `index.js`

This file initializes the main app by registering the `App.js` component as the root of your project.

### Code Explanation
- `import {registerRootComponent} from 'expo';`: This imports a function from Expo to register the root component of the app.
- `import App from './App';`: Imports the `App.js` file, which contains the main structure of your app.
- `registerRootComponent(App);`: Registers the `App` component as the entry point of your application.

This file ensures that the `App` component is properly initialized when the app starts.

# Database Storage Research

## NoSQL

### MongoDB 

A widely used document-based NoSQL database that stores data in JSON-like format (BSON). It's highly scalable 
and well-suited for applications with unstructured or semi-structured data.

#### Pros:
- Flexible schema: Useful for apps with changing or unstructured data (like user profiles with varying attributes).
- Scalable: Easily scales to handle large amounts of data and high traffic.
- JSON-like data format: Works well with front-end applications (e.g., React Native) since data is stored as BSON (similar to JSON).
- High availability: Supports replication and sharding, improving availability and performance.

#### Cons:
- No complex joins: Lacks the advanced relational querying capabilities of SQL databases, which can make some queries more complex.
- Not ideal for transactional systems: While MongoDB has transactional support, it's not as robust as relational databases like MySQL for complex transactions.
- Larger storage overhead: BSON can result in larger storage overhead compared to optimized relational storage.


## File Based Storage

### SQLite

A self-contained, file-based SQL database. It is lightweight and doesn't require a server. Great for small-scale
applications or mobile apps.

#### Pros:
- Lightweight: No need for a separate server; the database is stored as a single file, which is efficient for mobile apps.
- Easy to integrate: Built into many mobile frameworks and languages (React Native, Swift, etc.).
- ACID compliance: Supports transactions and ensures data consistency.
- No setup required: Ideal for small, self-contained mobile apps that don’t require server-based databases.

#### Cons:
- Limited scalability: Not suited for applications with large datasets or high concurrency.
- Single-user access: Doesn’t support multi-user environments efficiently, which could be a problem if the app scales.
- Basic feature set: Lacks some advanced features available in more robust databases like MySQL or PostgreSQL.

### JSON OR XML Files

Data can be stored in plain text files using formats like JSON or XML. This is a simple solution for lightweight 
applications or configurations but is not suitable for complex queries or large data sets.

#### Pros:
- Simple: Easy to read, write, and understand for small, structured data (e.g., user settings, local configurations).
- No database engine needed: No need to integrate a database system, making it lightweight and portable.
- Cross-platform: Easily manipulated by many languages (Python, JavaScript) and platforms.

#### Cons:
- No query support: You need to load the entire file and process data manually, which is inefficient for larger data sets.
- Data consistency: Lacks built-in transaction or concurrency support, so data integrity could become an issue.
- Slow performance: Not suited for large data sets or frequent read/write operations.

### CSV Files

Good for storing tabular data. This can be useful for simple data storage needs and is easy to manipulate with common 
programming languages like Python, JavaScript, or Excel.

#### Pros:
- Simple format: Easy to generate and parse for tabular data.
- Portable: Can be used across multiple platforms and languages (e.g., import/export functionality).
- Lightweight: Ideal for small data sets like user lists or logs.

#### Cons:
- No structure beyond tabular data: Not suitable for complex data relationships (like those found in relational databases).
- Lacks query functionality: Like JSON/XML, manual processing is required for data manipulation.
- No support for complex operations: Doesn’t support transactions, indexing, or advanced data structures.

## Relational Databases

### MySQL

Open-source relational database management system. It is best for applications requiring structured 
data storage and complex queries using SQL. MySQL supports ACID transactions, is scalable, and can handle large datasets.
Use Case: Web applications, e-commerce platforms, financial systems, content management systems.

#### Pros:
- Structured data: Ideal for apps with complex relationships between data (e.g., user accounts, roles, transactions).
- ACID compliance: Ensures data integrity and transactional safety, critical for applications like e-commerce or financial systems.
- Scalability: Can handle large-scale applications with high data volume.
- Strong community and support: Well-documented and widely used, with a large number of resources and support available.

#### Cons:
- Schema-bound: Requires careful upfront schema design and doesn’t offer the flexibility of NoSQL databases.
- Overhead: Requires more setup and maintenance (compared to SQLite or file-based storage).
- Horizontal scaling challenges: While MySQL can be scaled, it’s typically more difficult to horizontally scale compared to NoSQL solutions.
