Vendoring
```
wget https://github.com/sveltejs/svelte-todomvc/archive/refs/heads/master.zip
unzip master.zip
mv svelte-todomvc-master/* .
rm -r svelte-todomvc-master master.zip
```

Then udate rollup-plugin-svelte to 6.1.1 as per https://github.com/sveltejs/svelte/issues/5665#issuecomment-724180460 

Then to build, run:

```
yarn install
yarn run build
```
