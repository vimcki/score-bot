run:
	./fix_code.sh && npx tsc _index.ts && mv _index.js index.js && node --trace-warnings index.js
