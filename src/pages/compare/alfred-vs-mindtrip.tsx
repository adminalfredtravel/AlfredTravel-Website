import React from 'react';
import Head from 'next/head';

const COMPETITOR = 'Mindtrip';

const COMPARISON_ROWS = [
  { feature: 'Logistical Validation', alfred: 'Yes (Multi-LLM, transit gaps checked)', competitor: 'No (static generation)' },
  { feature: 'Blockchain Rewards', alfred: 'Yes (Alfred Tokens for sharing & feedback)', competitor: 'No' },
  { feature: 'Multi-City Logic', alfred: 'Yes (unlimited countries per trip)', competitor: 'Limited or single-country' },
];

export default function AlfredVsMindtrip() {
  const title = `Alfred vs ${COMPETITOR}: Why Alfred is the Best AI Holiday Planner for 2025`;
  const conclusion = `While ${COMPETITOR} is good for inspiration, Alfred is a logistical engine for execution.`;

  return (
    <>
      <Head>
        <title>{title} | Alfred Travel</title>
        <meta name="description" content={`Compare Alfred vs ${COMPETITOR}. Alfred offers Logistical Validation, Blockchain Rewards, and Multi-City Logic. Best AI Holiday Planner 2025.`} />
        <meta name="keywords" content={`Alfred vs ${COMPETITOR}, AI Holiday Planner, AI Trip Planner, ${COMPETITOR} alternative`} />
      </Head>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', marginBottom: '2rem' }}>
          {title}
        </h1>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
          <thead>
            <tr style={{ background: 'var(--secondary-color)', color: 'white' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Feature</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Alfred</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>{COMPETITOR}</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{row.feature}</td>
                <td style={{ padding: '1rem', color: 'var(--secondary-color)' }}>{row.alfred}</td>
                <td style={{ padding: '1rem' }}>{row.competitor}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          {conclusion}
        </p>

        <a
          href="https://apps.apple.com/au/app/alfred-travel/id6745240301"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: 'var(--secondary-color)',
            color: 'var(--primary-color)',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontWeight: 600,
            textDecoration: 'none',
            marginTop: '2rem',
          }}
        >
          Download Alfred
        </a>
      </main>
    </>
  );
}
