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
  title = '[청약 헬퍼] 주간 핵심 청약 브리핑',
  summaryText = '한국부동산원 청약홈 데이터를 기반으로 한 AI 요약 청약 정보입니다.',
  contentHtml = '<p>청약 정보 내용</p>',
  dateStr = new Date().toLocaleDateString('ko-KR'),
}: NewsletterEmailProps) => {
  return (
    <Html lang="ko">
      <Head />
      <Preview>{title} - {summaryText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={badgeText}>실시간 청약 정보 서비스</Text>
            <Heading style={headerTitle}>🏢 청약 헬퍼 뉴스레터</Heading>
            <Text style={headerDate}>{dateStr} 발행</Text>
          </Section>

          <Hr style={divider} />

          {/* Main Title & Summary */}
          <Section style={contentSection}>
            <Heading as="h2" style={newsletterHeading}>
              {title}
            </Heading>
            {summaryText && (
              <Text style={summaryParagraph}>
                💡 <strong>핵심 브리핑</strong>: {summaryText}
              </Text>
            )}

            {/* Newsletter Dynamic HTML Content */}
            <div
              style={bodyContent}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              본 메일은 청약 헬퍼 뉴스레터를 구독하신 분들께 발송되는 정기 청약 소식지입니다.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://www.applyhome.co.kr" style={footerLink}>
                한국부동산원 청약홈 바로가기
              </Link>
            </Text>
            <Text style={copyrightText}>
              © {new Date().getFullYear()} 청약 헬퍼 (RealEstateAgent). All rights reserved.
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
  backgroundColor: '#f1f5f9',
  color: '#0f172a',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  margin: '0 0 10px 0',
};

const headerTitle = {
  fontSize: '26px',
  fontWeight: '800',
  color: '#0f172a',
  margin: '0 0 6px 0',
  letterSpacing: '-0.5px',
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
  marginBottom: '24px',
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
  margin: '0 0 12px 0',
};

const footerLink = {
  color: '#2563eb',
  textDecoration: 'underline',
};

const copyrightText = {
  fontSize: '11px',
  color: '#cbd5e1',
  margin: '0',
};
