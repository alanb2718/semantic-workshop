<script lang="ts">
  import { Button, Helper } from 'flowbite-svelte';
  import { onMount } from 'svelte';

  // defaultRootServerURL can also be '' (that works)
  const defaultRootServerURL = 'https://bmlt.wszf.org/main_server/';
  const allLanguages: Record<string,string> = { 'de': 'Deutsch', 'dk': 'Dansk', 'en': 'English', 'es': 'Español',
    'fa': 'فارسی', 'fr': 'Français', 'it': 'Italiano', 'pl': 'Polskie', 'pt': 'Português', 'ru': 'Русский', 'sv': 'Svenska'
  };

  // state that is separate from a particular operation
  // rootServerUrl is what gets typed in the URL textbox
  let rootServerURL = $state(defaultRootServerURL);
  // the savedRootServerURL will always end in a / (added if necessary to the rootServerURL)
  let savedRootServerURL = $state(defaultRootServerURL);
  let serverError = $state();
  let operation = $state();
  let serverInfo: {langs: string, nativeLang: string}[] | undefined = $state();
  let serviceBodies: {name: string, id: string}[] | undefined = $state();
  let availableFields: {key: string, description: string}[] | undefined = $state();
  let langs: string[] | undefined = $state();
  let nativeLang: string | undefined = $state();

  // state for response URL
  let parameters = $derived(computeParameters());
  let responseURL = $derived(savedRootServerURL === '' || serverError ? '' : savedRootServerURL + 'client_interface/json/?switcher=' + operation + parameters);

  // state for Get Formats operation
  let formatLanguage: string | undefined = $state();
  let showAllFormats: boolean = $state(false);

  // state for Get Field Values operation
  let keyForGetFieldValues = $state();

  // state for NAWS dump operation
  let nawsDumpServiceBodyId = $state();

  async function updateRootServerURL() {
    const s = rootServerURL.trim();
    savedRootServerURL = s + (s === '' || s.endsWith('/') ? '' : '/');
    // reset state that won't be updated by getData();
    // this will be 'operation' itself, and also state for a particular operation
    operation = 'GetServiceBodies';
    formatLanguage = undefined;
    showAllFormats = false;
    keyForGetFieldValues = undefined;
    nawsDumpServiceBodyId = undefined;
    await getAllData();
  }

  async function getData(operation: string) {
    const response = await fetch(savedRootServerURL + 'client_interface/json/?switcher=' + operation);
    return response.json();
  }

  // Get data from the server that will be needed for building some of the queries.  Just get it all for now - later we
  // could only get the data if it's needed for a particular operation.
  async function getAllData() {
    if (savedRootServerURL === '') {
      serverInfo = undefined;
      langs = undefined;
      nativeLang = undefined;
      serviceBodies = [];
      availableFields = [];
    } else {
      try {
        serverInfo = await getData('GetServerInfo');
        langs = serverInfo?.[0].langs.split(',');
        nativeLang = serverInfo?.[0].nativeLang;
        serviceBodies = await getData('GetServiceBodies');
        serviceBodies?.sort((a, b) => a.name.localeCompare(b.name));
        availableFields = await getData('GetFieldKeys');
        availableFields?.sort((a, b) => a.description.localeCompare(b.description));
      } catch (error) {
        serverError = 'Server error -- ' + error;
        serverInfo = undefined;
        langs = undefined;
        nativeLang = undefined;
        serviceBodies = undefined;
        availableFields = undefined;
      }
    }
  }

  function computeParameters() {
    switch(operation) {
      case "GetSearchResults":
        // TODO: not completed
        return "";
      case "GetFormats":
        return (formatLanguage ? "&lang_enum=" + formatLanguage : "") + (showAllFormats ? "&show_all=1" : "");
      case "GetChanges":
        // TODO: not completed
        return "";
      case "GetFieldValues":
        return (keyForGetFieldValues ? "&meeting_key=" + keyForGetFieldValues : "");
      case "GetNAWSDump":
        return "&sb_id=" + nawsDumpServiceBodyId;
      default:
        // GetServiceBodies, GetFieldKeys, GetServerInfo, and GetCoverageArea take no parameters
        return "";
    }
  }

  onMount(getAllData);

</script>

<h1 class="mb-4">BMLT Semantic Workshop</h1>

<p class="mb-4">This is a re-implementation of the semantic workshop for the BMLT root server, intended to work
    with the new Svelte UI. It is currently a standalone app in SvelteKit. It could remain as a separate app, or
    later also be linked with the BMLT root server.
</p>

<label for="responseURL" class="block mt-6 text-sm font-medium text-gray-900 dark:text-white">Response URL:</label>
<output id="responseURL">
  {#if responseURL}
    <a href={responseURL} target="_blank"
      class="font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline">{responseURL}</a>
  {/if}
</output>

<form class="w-3/12 mb-4">
  <label for="rootServerURL" class="block mt-6 text-sm font-medium text-gray-900 dark:text-white">Root server URL:</label>
  <input type="url" id="rootServerURL" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
    focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600
    dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    placeholder="enter root server URL" required bind:value={rootServerURL} />
    <Button disabled={savedRootServerURL === rootServerURL} on:click={updateRootServerURL}
    class="bg-blue-400! border border-gray-300 text-gray-900 text-sm rounded-lg
    focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600
    dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
      Update root server URL
    </Button>
    <Helper class="bg-red-500!">
      {#if serverError}
        {serverError}
      {/if}
    </Helper>

  <label for="operation" class="block mt-6 text-sm font-medium text-gray-900 dark:text-white">Operation:</label>
  <select
      id="operation"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500
        block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
        dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4"
      bind:value={operation}>
    <option value="GetServiceBodies">Get Service Bodies</option>
    <option value="GetSearchResults">Get Meeting Search Results</option>
    <option value="GetFormats">Get Formats</option>
    <option value="GetChanges">Get Changes</option>
    <option value="GetFieldKeys">Get a List of Available Field Keys</option>
    <option value="GetFieldValues">Get a List of Specific Field Values</option>
    <option value="GetNAWSDump">Get a NAWS Format Export</option>
    <option value="GetServerInfo">Get Server Information</option>
    <option value="GetCoverageArea">Get Geographic Coverage Area</option>
  </select>


  {#if operation === "GetSearchResults"}
    todo: not finished
  {:else if operation === "GetFormats"}
    <label for="formatLanguage" class="block mt-6 text-sm font-medium text-gray-900 dark:text-white">Format language:</label>
    <select
        id="formatLanguage"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500
          block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
          dark:focus:ring-blue-500 dark:focus:border-blue-500"
        bind:value={formatLanguage} >
        <option value="">Server Language</option>
        {#each (langs as string[]) as key}
          <option value={key}>{allLanguages[key]}</option>
        {/each}
    </select>
    <label>
      <input type="checkbox" bind:checked={showAllFormats} />
      Show All Formats
    </label>
  {:else if operation === "GetChanges"}
    todo: not finished
  {:else if operation === "GetFieldValues"}
  <label for="keyForGetFieldValues" class="block mt-6 text-sm font-medium text-gray-900 dark:text-white">Field:</label>
  <select
      id="keyForGetFieldValues"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500
        block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
        dark:focus:ring-blue-500 dark:focus:border-blue-500"
      bind:value={keyForGetFieldValues} >
      {#each (availableFields as {key: string, description: string}[]) as f}
        <option value={f.key}>{f.description}</option>
      {/each}
  </select>
  {:else if operation === "GetNAWSDump"}
    <label for="nawsDumpServiceBodyId" class="block mt-6 text-sm font-medium text-gray-900 dark:text-white">Service body:</label>
    <select
        id="nawsDumpServiceBodyId"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500
          block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
          dark:focus:ring-blue-500 dark:focus:border-blue-500"
        bind:value={nawsDumpServiceBodyId} >
      {#each (serviceBodies as {name: string, id: string}[]) as s}
        <option value={s.id}>{s.name}</option>
      {/each}
    </select>
  <!-- no parameters for GetServiceBodies, GetFieldKeys, GetServerInfo, or GetCoverageArea -->
  {/if}
</form>
