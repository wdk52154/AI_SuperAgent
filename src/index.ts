const command = process.argv[2];

//根据命令行参数决定跑pnpm run init还是跑pnpm start 
async function main() {
  if (command === 'init') {
    const { runInit } = await import('./config/init.js');
    await runInit();
  } else {
    const { startAgent } = await import('./main.js');
    await startAgent();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
