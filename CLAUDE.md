# Responsive Design and Internationalization Requirements

## Responsive Design

All user interfaces, screens, components, dialogs, tables, forms, and visual elements must be fully responsive and provide a consistent experience across different screen sizes and devices.

### Mandatory Requirements

* Mobile-first approach whenever possible.
* Support for desktop, tablet, and mobile devices.
* No horizontal scrolling caused by layout issues.
* Components must adapt gracefully to different viewport sizes.
* Text, buttons, inputs, and interactive elements must remain accessible and usable on smaller screens.
* Grids and layouts should collapse or reorganize appropriately for mobile devices.
* Modals, side panels, and dialogs must be optimized for both desktop and mobile experiences.
* Ensure proper behavior when changing screen orientation.
* Test all new features in common mobile and desktop resolutions.

---

## Internationalization (i18n)

The entire application must be fully compatible with internationalization and localization requirements.

### Mandatory Requirements

* Never use hardcoded labels, texts, messages, titles, placeholders, tooltips, validation messages, button texts, or any user-facing content.
* Every visible text must be retrieved through the translation system.
* Translation keys must be used instead of literal strings.
* Before using a translation key, ensure that the key exists in all supported language files.
* When creating new labels, add the corresponding translation key to every available language JSON file.
* Error messages, toast notifications, modal content, table headers, filters, form labels, and accessibility attributes must also be translated.
* Avoid concatenating translated strings. Prefer complete translation entries with interpolation variables when necessary.
* All newly developed features must be reviewed to guarantee full i18n compliance.

### Example

❌ Incorrect

```html
<button>Save</button>
```

✅ Correct

```html
<button>{{ 'common.save' | translate }}</button>
```

---

## Validation Checklist

Before considering any implementation complete, verify:

* [ ] The feature is fully responsive on desktop and mobile.
* [ ] No user-facing text is hardcoded.
* [ ] All translation keys exist in every supported language file.
* [ ] Toasts, modals, validations, and error messages are translated.
* [ ] Layout remains functional across different screen sizes.
* [ ] Theme changes (light/dark mode, when applicable) do not break the UI.
