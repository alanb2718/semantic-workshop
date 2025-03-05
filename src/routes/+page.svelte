<script lang="ts">
  import { Button } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  // omit validator for now:
  // import { validator } from '@felte/validator-yup';
  // import * as yup from 'yup';

  const defaultRootServerURL = 'https://bmlt.wszf.org/main_server/'
  let rootServerURL = $state(defaultRootServerURL);
  let savedRootServerURL = $state(defaultRootServerURL);
  let operation = $state('');
  let serverInfo: {langs: string, nativeLang: string}[] | undefined = $state();
  let serviceBodies: {name: string, id: string}[] | undefined = $state();
  let serviceBodyId = $state();

  let langs: string[] | undefined = $state();
  let nativeLang: string | undefined = $state();
  let formatLanguage: string | undefined = $state();
  let showAllFormats: boolean = $state(false);

  let parameters = $derived(computeParameters());
  let responseURL = $derived(savedRootServerURL + 'client_interface/json/?switcher=' + operation + parameters);

  const allLanguages: Record<string,string> = { 'de': 'Deutsch', 'dk': 'Dansk', 'en': 'English', 'es': 'Español',
    'fa': 'فارسی', 'fr': 'Français', 'it': 'Italiano', 'pl': 'Polskie', 'pt': 'Português', 'ru': 'Русский', 'sv': 'Svenska'
  };

  async function updateRootServerURL() {
    savedRootServerURL = rootServerURL;
    getData();
  }

  // Get data from the server that will be needed for building some of the queries (just get it all for now).
  // This can be called from onMount, because the root server URL is hardwired.
  async function getData() {
    const serverInfoResponse = await fetch(rootServerURL + 'client_interface/json/?switcher=GetServerInfo');
    serverInfo = (await serverInfoResponse.json());
    langs = serverInfo?.[0].langs.split(',');
    nativeLang = serverInfo?.[0].nativeLang;
    const serviceBodiesResponse = await fetch(rootServerURL + 'client_interface/json/?switcher=GetServiceBodies');
    serviceBodies = await serviceBodiesResponse.json();
    serviceBodies?.sort((a, b) => a.name.localeCompare(b.name));
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
      case "GetFieldKeys":
        // TODO: not completed
        return "";
      case "GetFieldValues":
        // TODO: not completed
        return "";
      case "GetNAWSDump":
        return "&sb_id=" + serviceBodyId;
      default:
        // GetServiceBodies, GetServerInfo, and GetCoverageArea take no parameters
        return "";
    }
  }

  onMount(getData);

</script>

<h1 class="mb-4">BMLT Semantic Workshop</h1>

<p class="mb-4">This is a re-implementation of the semantic workshop for the BMLT root server, intended to work
    with the new Svelte UI. It is currently a standalone app in SvelteKit. It could remain as a separate app, or
    later also be linked with the BMLT root server.
</p>

<p>Response URL:
  {#if operation}
    <a href={responseURL} target="_blank"
       class="font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline">{responseURL}</a>
  {:else}
    [no operation selected]
  {/if}
</p>


<Button disabled={savedRootServerURL === rootServerURL} on:click={updateRootServerURL} >
  Update root server URL
</Button>

<form class="w-3/12 mb-4">
  <label for="rootServerURL" class="block mt-6 text-sm font-medium text-gray-900 dark:text-white">Root server URL:</label>
  <input type="url" id="rootServerURL" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
    focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600
    dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    required bind:value={rootServerURL} />

  <label for="operation" class="block mt-6 text-sm font-medium text-gray-900 dark:text-white">Operation:</label>
  <select
      id="operation"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500
        block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
        dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4"
      bind:value={operation}>
    <option value="" disabled selected></option>
    <option value="GetSearchResults">Get Meeting Search Results</option>
    <option value="GetFormats">Get Formats</option>
    <option value="GetServiceBodies">Get Service Bodies</option>
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
  {:else if operation === "GetFieldKeys"}
    todo: not finished
  {:else if operation === "GetFieldValues"}
    todo: not finished
  {:else if operation === "GetNAWSDump"}
    <label for="serviceBodyId" class="block mt-6 text-sm font-medium text-gray-900 dark:text-white">Service body:</label>
    <select
        id="serviceBodyId"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500
          block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
          dark:focus:ring-blue-500 dark:focus:border-blue-500"
        bind:value={serviceBodyId} >
      {#each (serviceBodies as {name: string, id: string}[]) as s}
        <option value={s.id}>{s.name}</option>
      {/each}
    </select>
  <!-- no parameters for GetServiceBodies, GetServerInfo, or GetCoverageArea -->
  {/if}
</form>
