# powerball
Quick CLI tool to calculate winnings in office powerball pools

### To Run:
```
npm install
node src/main.js
```

### Read File of Tickets
Using the `file` option when running main.js, you can import tickets in bulk as long as the file matches the following format:

```
10	12	30	40	37	12
10	12	30	40	37	12
10	12	30	40	37	12
10	12	30	40	37	12
```

Where the first 5 numbers of each row are white ball numbers and the last number is the powerball.

or

```
123123	10	12	30	40	37	12
123123	10	12	30	40	37	12
123123	10	12	30	40	37	12
123123	10	12	30	40	37	12
```

Where the first number is the id of the ticket, the next 5 numbers of each row are white ball numbers and the last number is the powerball.

Do not include a header in your file.

All numbers must be delimited by a TAB (\t)
