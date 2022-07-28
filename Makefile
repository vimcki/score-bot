run:
	npx tsc && node --trace-warnings ./src/index.js

find_missing:
	npx tsc && node --trace-warnings ./src/find_missing.js
