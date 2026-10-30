<script lang="ts">
  // Csendvadász: a magyar változat módosítása (lásd NOTICE.md)
  /**
   * A projektről: honnan jön, mit tud, és mi a licenc.
   *
   * Az eredeti alkalmazás (Shy Safari, teacher.dev) Apache-2.0 licenc alatt
   * jelent meg, ezért a magyar változat szabadon használható és terjeszthető.
   * A licenc két helyen is megjelenik: a NOTICE.md a módosításokat sorolja
   * fel, a LICENSE.txt pedig az eredeti licencszöveget tartalmazza.
   */

  import DocPage from "$lib/components/DocPage.svelte";
  import PageMeta from "$lib/components/PageMeta.svelte";
  import { t } from "$lib/i18n/index.svelte";

  const card = "mb-6 rounded-2xl bg-white/90 p-6 shadow-lg shadow-amber-900/5";
  const link = "font-semibold text-teal-700 underline-offset-4 hover:underline";

  const UPSTREAM = "https://github.com/teacherdotdev/shy-safari";
  const TEACHER_DEV = "https://teacher.dev";
  const APACHE = "https://www.apache.org/licenses/LICENSE-2.0";
</script>

<PageMeta
  path="/about"
  title={t("about.pageTitle")}
  description={t("about.meta")}
/>

<DocPage title={t("about.title")} lede={t("about.lede")}>
  <section class={card}>
    <h2 class="mb-3 text-xl font-semibold">{t("about.originTitle")}</h2>
    <p class="leading-relaxed text-slate-700">
      {t("about.origin.beforeEvent")}<a
        href={UPSTREAM}
        target="_blank"
        rel="noopener noreferrer"
        class={link}>Shy Safari</a
      >{t("about.origin.afterEvent")}<a
        href={TEACHER_DEV}
        target="_blank"
        rel="noopener noreferrer"
        class={link}>teacher.dev</a
      >{t("about.origin.afterTeacher")}
    </p>
  </section>

  <section class={card}>
    <h2 class="mb-3 text-xl font-semibold">{t("about.purposeTitle")}</h2>
    <p class="leading-relaxed text-slate-700">{t("about.purpose")}</p>
  </section>

  <section class={card}>
    <h2 class="mb-3 text-xl font-semibold">{t("about.promiseTitle")}</h2>
    <p class="leading-relaxed text-slate-700">{t("about.promise")}</p>
  </section>

  <section class={card}>
    <h2 class="mb-3 text-xl font-semibold">{t("about.licenceTitle")}</h2>
    <p class="leading-relaxed text-slate-700">{t("about.licence")}</p>
    <p class="mt-3">
      <a href={APACHE} target="_blank" rel="noopener noreferrer" class={link}
        >{t("about.licenceLink")}</a
      >
    </p>
  </section>
</DocPage>
