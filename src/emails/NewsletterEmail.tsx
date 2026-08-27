import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface NewsletterEmailProps {
  title: string;
  summaryText: string;
  contentHtml: string;
  dateStr?: string;
}

export const NewsletterEmail = ({
  title = '[집모아] 아파트 & 줍줍 심층 청약 분석 리포트',
  summaryText = '한국부동산원 청약홈 데이터를 기반으로 한 AI 심층 분석 청약 정보입니다.',
  contentHtml = '<p>청약 정보 내용</p>',
  dateStr = new Date().toLocaleDateString('ko-KR'),
}: NewsletterEmailProps) => {
  const siteUrl = 'https://realestateagent-12hc.vercel.app';

  return (
    <Html lang="ko">
      <Head />
      <Preview>{title} - {summaryText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={badgeText}>⚡ 실시간 청약홈 연동 & AI 분석</Text>
            <Heading style={headerTitle}>
              <Link href={siteUrl} style={headerTitleLink}>
                🏠 집모아 (ZipMoa)
              </Link>
            </Heading>
            <Text style={headerDate}>{dateStr} 리포트</Text>
          </Section>

          <Hr style={divider} />

          {/* Main Title & Summary */}
          <Section style={contentSection}>
            <Heading as="h2" style={newsletterHeading}>
              {title}
            </Heading>
            {summaryText && (
              <Text style={summaryParagraph}>
                💡 <strong>핵심 요약</strong>: {summaryText}
              </Text>
            )}

            {/* Direct Homepage Link CTA Button */}
            <div style={ctaButtonContainer}>
              <Link href={siteUrl} style={ctaButton}>
                🏠 집모아 메인 홈페이지에서 실시간 리포트 보기 →
              </Link>
            </div>

            {/* Newsletter Dynamic HTML Content */}
            <div
              style={bodyContent}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* Bottom Homepage Link CTA Button */}
            <div style={ctaButtonContainer}>
              <Link href={siteUrl} style={ctaButton}>
                🌐 집모아 메인 홈페이지 바로가기 (전국 청약 조회) →
              </Link>
            </div>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              본 메일은 집모아 (ZipMoa) 청약 서비스를 이용해 주시는 분들께 발송되는 정기 청약 소식지입니다.
            </Text>
            <Text style={footerLinks}>
              <Link href={siteUrl} style={footerLink}>
                🏠 집모아 메인 홈페이지
              </Link>
              {' · '}
              <Link href="https://www.applyhome.co.kr" style={footerLink}>
                한국부동산원 청약홈
              </Link>
            </Text>
            <Text style={companyText}>
              도즈소프트 | 대표: 김인중 | 사업자등록번호: 402-20-88549 | 이메일: dozesoft@gmail.com
            </Text>
            <Text style={copyrightText}>
              © {new Date().getFullYear()} 집모아 (ZipMoa). All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default NewsletterEmail;

// Inline Styles for Cross-Client Email Compatibility
const main = {
  backgroundColor: '#f1f5f9',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: '30px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '32px 28px',
  borderRadius: '16px',
  maxWidth: '600px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  border: '1px solid #e2e8f0',
};

const headerSection = {
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const badgeText = {
  display: 'inline-block',
  padding: '4px 12px',
  backgroundColor: '#eff6ff',
  color: '#2563eb',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '700',
  margin: '0 0 10px 0',
};

const headerTitle = {
  fontSize: '26px',
  fontWeight: '800',
  color: '#0f172a',
  margin: '0 0 6px 0',
  letterSpacing: '-0.5px',
};

const headerTitleLink = {
  color: '#0f172a',
  textDecoration: 'none',
};

const headerDate = {
  fontSize: '13px',
  color: '#64748b',
  margin: '0',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
};

const contentSection = {
  padding: '4px 0',
};

const newsletterHeading = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#0f172a',
  marginBottom: '12px',
  lineHeight: '1.4',
};

const summaryParagraph = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#334155',
  backgroundColor: '#f8fafc',
  padding: '12px 16px',
  borderRadius: '8px',
  borderLeft: '4px solid #3b82f6',
  marginBottom: '20px',
};

const ctaButtonContainer = {
  textAlign: 'center' as const,
  margin: '20px 0',
};

const ctaButton = {
  display: 'inline-block',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '10px',
  fontWeight: '700',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

const bodyContent = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#334155',
};

const footerSection = {
  textAlign: 'center' as const,
  paddingTop: '8px',
};

const footerText = {
  fontSize: '12px',
  color: '#94a3b8',
  lineHeight: '1.5',
  margin: '0 0 8px 0',
};

const footerLinks = {
  fontSize: '12px',
  color: '#64748b',
  margin: '0 0 10px 0',
};

const footerLink = {
  color: '#2563eb',
  textDecoration: 'underline',
  fontWeight: '600',
};

const companyText = {
  fontSize: '11px',
  color: '#64748b',
  margin: '0 0 6px 0',
};

const copyrightText = {
  fontSize: '11px',
  color: '#cbd5e1',
  margin: '0',
};
