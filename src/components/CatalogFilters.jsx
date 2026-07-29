import styles from './CatalogFilters.module.css';

/**
 * Панель поиска и фильтров над каталогом раздела.
 *
 * Группы фильтров показываются только тогда, когда в разделе есть из чего
 * выбирать: если все материалы относятся к одной дисциплине, ряд «Дисциплина»
 * не отображается и не занимает место.
 *
 * @param {object}   props
 * @param {object}   props.filters   доступные значения { disciplines, courses, kinds }
 * @param {object}   props.value     текущее состояние { query, discipline, course, kind }
 * @param {function} props.onChange  получает новое состояние целиком
 * @param {number}   props.shown     сколько материалов показано
 * @param {number}   props.total     сколько всего в разделе
 */
export default function CatalogFilters({ filters, value, onChange, shown, total }) {
  const set = (patch) => onChange({ ...value, ...patch });

  const isFiltered =
    Boolean(value.query) || Boolean(value.discipline) || Boolean(value.course) || Boolean(value.kind);

  const rows = [
    { key: 'discipline', label: 'Дисциплина', options: filters.disciplines },
    { key: 'course', label: 'Курс', options: filters.courses.map((c) => ({ value: c, label: `${c} курс` })) },
    { key: 'kind', label: 'Тип материала', options: filters.kinds },
  ].filter((row) => row.options.length > 1);

  return (
    <div className={styles.panel}>
      <div className={styles.searchRow}>
        <div className={styles.searchWrapper}>
          <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`} aria-hidden="true" />
          <input
            type="search"
            className={`form-control ${styles.search}`}
            placeholder="Поиск: номер работы, дисциплина, название файла…"
            value={value.query}
            onChange={(event) => set({ query: event.target.value })}
            aria-label="Поиск по материалам раздела"
          />
        </div>

        {isFiltered && (
          <button
            type="button"
            className={`btn btn-outline-secondary btn-sm ${styles.reset}`}
            onClick={() => onChange({ query: '', discipline: '', course: '', kind: '' })}
          >
            <i className="fa-solid fa-rotate-left me-1" aria-hidden="true" />
            Сбросить
          </button>
        )}
      </div>

      {rows.map((row) => (
        <div className={styles.row} key={row.key}>
          <span className={styles.rowLabel}>{row.label}</span>
          <div className={styles.chips}>
            <button
              type="button"
              className={`${styles.chip} ${value[row.key] === '' ? styles.chipActive : ''}`}
              onClick={() => set({ [row.key]: '' })}
            >
              Все
            </button>

            {row.options.map((option) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              const isActive = String(value[row.key]) === String(optionValue);

              return (
                <button
                  key={optionValue}
                  type="button"
                  className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
                  onClick={() => set({ [row.key]: isActive ? '' : optionValue })}
                >
                  {optionLabel}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className={styles.counter}>
        {shown === total ? (
          <>Материалов в разделе: <strong>{total}</strong></>
        ) : (
          <>
            Показано <strong>{shown}</strong> из {total}
          </>
        )}
      </p>
    </div>
  );
}
