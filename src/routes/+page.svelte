<script>
	let rootserver = $state('https://bmlt.wszf.org/main_server/');
  let operation = $state('');
  // not sure this should be here
  let serviceBodyId = $state();
  let serviceBodies = $state();

  let parameters = $derived(computeParameters());
  let response_url = $derived(rootserver + 'client_interface/json/?switcher=' + operation + parameters);

  async function getServiceBodies() {
    const response = await fetch(rootserver + 'client_interface/json/?switcher=GetServiceBodies');
    // serviceBodies = [ {name: 'Big Region', id: 3 }, {name: 'Small Region', id: 4 } ];
    serviceBodies = await response.json();
    serviceBodies.sort((a, b) => a.name.localeCompare(b.name));
  }

  async function getOperationParameters() {
    switch(operation) {
      case "GetNAWSDump":
        getServiceBodies();
        break;
      default:
        break;
    }
  }

  function computeParameters() {
    switch(operation) {
      case "GetNAWSDump":
        return "&sb_id=" + serviceBodyId;
      default:
        return "";
    }
  }

</script>

<h1 class="mb-4">BMLT Semantic Workshop</h1>

<p class="mb-4">This is a re-implementation of the semantic workshop for the BMLT root server, intended to work
    with the new Svelte UI.  For now it is a standalone app in SvelteKit.  It could remain separate, or else be
    integrated with the root server.
</p>

<p>Response URL:
  {#if operation}
    <a href={response_url} target="_blank"
       class="font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline">{response_url}</a>
  {:else}
    [no operation selected]
  {/if}
</p>

<form class="w-3/12 mb-4">

  <label for="rootserver" class="block mt-6 text-sm font-medium text-gray-900 dark:text-white">Root server URL:</label>
  <input type="url" id="rootserver" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
    focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600
    dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    required bind:value={rootserver} />

  <label for="operation" class="block mt-6 text-sm font-medium text-gray-900 dark:text-white">Operation:</label>
  <select
      id="operation"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500
        block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
        dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4"
      bind:value={operation}
      onchange={getOperationParameters}>
    <option value="" disabled selected></option>
    <option value="GetServiceBodies">Get Service Bodies</option>
    <option value="GetNAWSDump">Get a NAWS Format Export</option>
    <option value="GetServerInfo">Get Server Information</option>
  </select>


  {#if operation === "GetNAWSDump"}
    <label for="serviceBodyId" class="block mt-6 text-sm font-medium text-gray-900 dark:text-white">Service body:</label>
    <select
        id="serviceBodyId"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500
          block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
          dark:focus:ring-blue-500 dark:focus:border-blue-500"
        bind:value={serviceBodyId} >
      {#each serviceBodies as s}
        <option value={s.id}>{s.name}</option>
      {/each}
    </select>
  {/if}
</form>
